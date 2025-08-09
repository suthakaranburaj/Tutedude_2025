from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    mongodb_url: str
    server_port: int = 8000
    access_token_secret: str
    refresh_token_secret: str
    cloudinary_cloud_name: str
    cloudinary_api_key: str
    cloudinary_api_secret: str
    
    class Config:
        env_file = ".env"

settings = Settings()