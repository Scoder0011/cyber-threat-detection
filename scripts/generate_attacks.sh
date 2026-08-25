#!/usr/bin/env bash
# =============================================================================
# ⚔️ Threat & Attack Traffic Generator
# =============================================================================
# Simulates specialized attack vectors using standard lab attack signatures:
# 1. hping3: TCP SYN Flood, UDP Flood, ICMP sweeps
# 2. Slowloris: Low-and-slow HTTP resource exhaustion
# 3. dnscat2 / iodine: Covert C2 & data exfiltration over DNS tunnels
# 4. DGArchive DGA algorithms: Algorithmic domain queries
# 5. Sandboxed C2 Emulator: Periodic callback beaconing with jitter
# =============================================================================

set -e

VECTOR="${1:-all}"  # all | syn_flood | udp_flood | slowloris | dns_tunnel | dga | c2_beacon
TARGET_IP="${2:-10.0.10.20}"
DURATION="${3:-15}" # seconds
MODE="${4:-simulate}" # simulate | live

echo "================================================================="
echo "🚨 Launching Lab Attack Traffic Simulation"
echo "Vector: $VECTOR | Target: $TARGET_IP | Duration: ${DURATION}s"
echo "================================================================="

# --- 1. hping3 SYN Flood & UDP Flood ---
run_hping3_syn() {
    echo "[+] [hping3] Simulating TCP SYN Flood on $TARGET_IP:80..."
    if command -v hping3 >/dev/null 2>&1 && [ "$MODE" = "live" ]; then
        sudo hping3 -S --flood -V -p 80 "$TARGET_IP" &
        HPID=$!
        sleep "$DURATION"
        kill -9 "$HPID" 2>/dev/null || true
    else
        python3 -c "
import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname('$0'), '..')))
from data.generate_datasets import generate_syn_flood_flows
flows = generate_syn_flood_flows(count=500, target_ip='$TARGET_IP')
print(f'  [✓] Generated {len(flows)} hping3 TCP SYN flood flows targeting $TARGET_IP:80')
"
    fi
}

run_hping3_udp() {
    echo "[+] [hping3] Simulating UDP Flood / Amplification Reflection on $TARGET_IP..."
    if command -v hping3 >/dev/null 2>&1 && [ "$MODE" = "live" ]; then
        sudo hping3 --udp --flood -p 53 "$TARGET_IP" &
        HPID=$!
        sleep "$DURATION"
        kill -9 "$HPID" 2>/dev/null || true
    else
        python3 -c "
import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname('$0'), '..')))
from data.generate_datasets import generate_udp_amp_flows
flows = generate_udp_amp_flows(count=300, target_ip='$TARGET_IP')
print(f'  [✓] Generated {len(flows)} hping3 UDP reflection amplification flows.')
"
    fi
}

# --- 2. Slowloris Slow HTTP Exhaustion ---
run_slowloris() {
    echo "[+] [Slowloris] Simulating low-and-slow HTTP depletion attack..."
    python3 -c "
import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname('$0'), '..')))
from data.generate_datasets import generate_slowloris_flows
flows = generate_slowloris_flows(count=150, target_ip='$TARGET_IP')
print(f'  [✓] Generated {len(flows)} Slowloris persistent connection exhaustion flows.')
"
}

# --- 3. dnscat2 & iodine DNS Tunneling ---
run_dns_tunnel() {
    echo "[+] [dnscat2 / iodine] Simulating DNS Tunneling & Exfiltration..."
    python3 -c "
import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname('$0'), '..')))
from data.generate_datasets import generate_dns_tunneling_queries
queries = generate_dns_tunneling_queries(count=300, client_ip='192.168.1.88', c2_server='tunnel.dnscat2-c2.org')
print(f'  [✓] Generated {len(queries)} dnscat2/iodine DNS tunneling records (Base64/Hex TXT records).')
"
}

# --- 4. DGA Domains (DGArchive Algorithms) ---
run_dga() {
    echo "[+] [DGArchive] Simulating Domain Generation Algorithm (DGA) queries..."
    python3 -c "
import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname('$0'), '..')))
from data.generate_datasets import generate_dga_domains
domains = generate_dga_domains(count=500)
print(f'  [✓] Generated {len(domains)} DGA domain queries across Cryptolocker, Necurs, Banjori, Suppobox, Mirai, Matsnu.')
"
}

# --- 5. Sandboxed C2 Emulator (Beaconing Timing) ---
run_c2_beacon() {
    echo "[+] [C2 Emulator] Simulating periodic C2 heartbeat beaconing (10s interval + jitter)..."
    python3 -c "
import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname('$0'), '..')))
from data.generate_datasets import generate_c2_beaconing_flows
flows = generate_c2_beaconing_flows(count=200, victim_ip='192.168.1.45', c2_ip='185.220.101.44', interval_sec=10.0)
print(f'  [✓] Generated {len(flows)} C2 emulator callback beaconing flows (interval=10.0s, jitter < 0.05s).')
"
}

# Execute requested vector
case "$VECTOR" in
    syn_flood)
        run_hping3_syn
        ;;
    udp_flood)
        run_hping3_udp
        ;;
    slowloris)
        run_slowloris
        ;;
    dns_tunnel)
        run_dns_tunnel
        ;;
    dga)
        run_dga
        ;;
    c2_beacon)
        run_c2_beacon
        ;;
    all)
        run_hping3_syn
        run_hping3_udp
        run_slowloris
        run_dns_tunnel
        run_dga
        run_c2_beacon
        ;;
    *)
        echo "Unknown vector: $VECTOR. Options: all | syn_flood | udp_flood | slowloris | dns_tunnel | dga | c2_beacon"
        exit 1
        ;;
esac

echo "================================================================="
echo "✅ Threat Simulation Completed Successfully!"
echo "================================================================="
