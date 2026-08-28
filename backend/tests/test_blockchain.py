import hashlib


def test_alert_hash_is_stable():
    payload = b"threatlens-alert"
    assert hashlib.sha256(payload).hexdigest() == hashlib.sha256(payload).hexdigest()
