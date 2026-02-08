from pydantic import BaseModel

class PromotionBase(BaseModel):
    title: str
    description: str
    image_url: str

class PromotionCreate(PromotionBase):
    pass

class Promotion(PromotionBase):
    id: int

    class Config:
        orm_mode = True
