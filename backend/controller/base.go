package controller

import "github.com/gin-gonic/gin"

func SetupRoutes(router *gin.Engine, tc *TabController) {
	api := router.Group("/api")
	{
		tabs := api.Group("/tabs")
		{
			tabs.GET("", tc.GetAllTabs)
			tabs.POST("", tc.CreateTab)
			tabs.GET("/:id", tc.GetTabById)
			tabs.PUT("/:id", tc.UpdateTab)
			tabs.DELETE("/:id", tc.DeleteTab)
		}
	}
}
