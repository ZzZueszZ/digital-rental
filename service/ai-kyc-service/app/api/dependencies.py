from fastapi import Header, HTTPException

from app.config import get_settings


def require_api_key(
    api_key: str | None = Header(default=None, alias="api-key"),
    api_key_alt: str | None = Header(default=None, alias="api_key"),
) -> None:
    configured = get_settings().api_key
    provided = api_key or api_key_alt
    if configured and provided != configured:
        raise HTTPException(status_code=401, detail="Invalid API key")
