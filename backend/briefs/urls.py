from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BriefViewSet

router = DefaultRouter()
router.register(r"", BriefViewSet, basename="brief")

urlpatterns = [
    path("", include(router.urls)),
]