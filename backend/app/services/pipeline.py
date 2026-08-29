import asyncio
import time
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.db.models import NetworkFlow, ThreatAlert
from app.controller.bot_registry import bot_registry
from app.controller.main_controller import evaluate_flow_fusion
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

async def process_flows_pipeline():
    """
    Background worker that continuously fetches un-processed network flows from the database,
    sends them to the AI bots for predictions, and uses the main controller to fuse scores
    and generate ThreatAlerts.
    """
    logger.info("Starting background flow processing pipeline...")
    last_processed_time = None
    
    while True:
        try:
            db = SessionLocal()
            try:
                # Poll flows we haven't processed yet, ordering by timestamp ascending
                query = db.query(NetworkFlow)
                if last_processed_time:
                    query = query.filter(NetworkFlow.timestamp > last_processed_time)
                
                flows = query.order_by(NetworkFlow.timestamp.asc()).limit(50).all()
                
                for flow in flows:
                    flow_dict = {
                        "id": flow.id,
                        "flow_id": flow.flow_id,
                        "src_ip": flow.src_ip,
                        "dst_ip": flow.dst_ip,
                        "src_port": flow.src_port,
                        "dst_port": flow.dst_port,
                        "protocol": flow.protocol,
                        "bytes_out": flow.bytes_out,
                        "duration": float(flow.duration) if flow.duration else 0.0,
                    }
                    
                    # 1. Send to AI Bots
                    predictions = bot_registry.dispatch_to_bots(flow_dict)
                    
                    # 2. Format predictions for fusion controller
                    # The fusion controller expects a dict like: {"ddos_bot": {"malicious": True, "confidence": 0.88, "label": "SYN Flood"}}
                    formatted_preds = {}
                    for p in predictions:
                        bot_name = p.get("bot_name", "unknown_bot")
                        formatted_preds[bot_name] = p
                    
                    # 3. Fuse scores and potentially generate an alert
                    if formatted_preds:
                        alert = evaluate_flow_fusion(flow_dict, formatted_preds, db)
                        if alert:
                            logger.info(f"Generated alert {alert.alert_id} for flow {flow.flow_id}")
                    
                    last_processed_time = flow.timestamp
                    
                db.commit()
            except Exception as e:
                db.rollback()
                logger.error(f"Error in pipeline iteration: {e}")
            finally:
                db.close()
                
            await asyncio.sleep(5)  # Poll every 5 seconds
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"Fatal pipeline error: {e}")
            await asyncio.sleep(10)
