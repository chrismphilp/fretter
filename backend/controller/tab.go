package controller

import (
	"context"
	"errors"
	"net/http"
	"time"

	"backend/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type TabController struct {
	TabsCollection *mongo.Collection
}

func NewTabController(db *mongo.Database) *TabController {
	return &TabController{
		TabsCollection: db.Collection("tabs"),
	}
}

func (c *TabController) SetupRoutes(router *gin.Engine) {
	api := router.Group("/api")
	{
		tabs := api.Group("/tabs")
		{
			tabs.GET("", c.GetAllTabs)
			tabs.POST("", c.CreateTab)
			tabs.GET("/:id", c.GetTabById)
			tabs.PUT("/:id", c.UpdateTab)
			tabs.DELETE("/:id", c.DeleteTab)
		}
	}
}

func (c *TabController) GetAllTabs(ctx *gin.Context) {
	dbCtx, cancel := context.WithTimeout(ctx.Request.Context(), 5*time.Second)
	defer cancel()

	cursor, err := c.TabsCollection.Find(dbCtx, bson.M{})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer cursor.Close(dbCtx)

	var tabs []models.Tab
	if err = cursor.All(dbCtx, &tabs); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, tabs)
}

func (c *TabController) CreateTab(ctx *gin.Context) {
	var tab models.Tab
	if err := ctx.ShouldBindJSON(&tab); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	dbCtx, cancel := context.WithTimeout(ctx.Request.Context(), 5*time.Second)
	defer cancel()

	// Generate ObjectIDs for tab and all nested elements if they don't exist
	if tab.ID.IsZero() {
		tab.ID = primitive.NewObjectID()
	}

	for i := range tab.Groups {
		if tab.Groups[i].ID.IsZero() {
			tab.Groups[i].ID = primitive.NewObjectID()
		}

		for j := range tab.Groups[i].Notes {
			for k := range tab.Groups[i].Notes[j] {
				if tab.Groups[i].Notes[j][k].ID.IsZero() {
					tab.Groups[i].Notes[j][k].ID = primitive.NewObjectID()
				}
			}
		}
	}

	result, err := c.TabsCollection.InsertOne(dbCtx, tab)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"id":      result.InsertedID,
		"message": "Tab created successfully",
	})
}

func (c *TabController) GetTabById(ctx *gin.Context) {
	id := ctx.Param("id")
	if id == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tab ID"})
		return
	}

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tab ID format"})
		return
	}

	dbCtx, cancel := context.WithTimeout(ctx.Request.Context(), 5*time.Second)
	defer cancel()

	var tab models.Tab
	err = c.TabsCollection.FindOne(dbCtx, bson.M{"_id": objectID}).Decode(&tab)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "Tab not found"})
		} else {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}
	ctx.JSON(http.StatusOK, tab)
}

func (c *TabController) UpdateTab(ctx *gin.Context) {
	id := ctx.Param("id")
	if id == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tab ID"})
		return
	}

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tab ID format"})
		return
	}

	var tab models.Tab
	if err := ctx.ShouldBindJSON(&tab); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Set the ID from the URL
	tab.ID = objectID

	dbCtx, cancel := context.WithTimeout(ctx.Request.Context(), 5*time.Second)
	defer cancel()

	// Update the document
	result, err := c.TabsCollection.ReplaceOne(dbCtx, bson.M{"_id": objectID}, tab)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if result.MatchedCount == 0 {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Tab not found"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Tab updated successfully"})
}

func (c *TabController) DeleteTab(ctx *gin.Context) {
	id := ctx.Param("id")
	if id == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tab ID"})
		return
	}

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tab ID format"})
		return
	}

	dbCtx, cancel := context.WithTimeout(ctx.Request.Context(), 5*time.Second)
	defer cancel()

	result, err := c.TabsCollection.DeleteOne(dbCtx, bson.M{"_id": objectID})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if result.DeletedCount == 0 {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Tab not found"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Tab deleted successfully"})
}
