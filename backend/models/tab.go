package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Tab struct {
	ID     primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	Groups []TabGroup         `json:"groups" bson:"groups"`
	Tempo  int                `json:"tempo" bson:"tempo"`
	Capo   int                `json:"capo" bson:"capo"`
}

type TabGroup struct {
	ID         primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	TabID      string             `json:"tabId" bson:"tabId"`
	GroupIndex int                `json:"groupIndex" bson:"groupIndex"`
	Notes      [][]Note           `json:"notes" bson:"notes"`
}

type Note struct {
	ID               primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	TabGroupID       string             `json:"tabGroupId,omitempty" bson:"tabGroupId,omitempty"`
	StringIndex      int                `json:"stringIndex" bson:"stringIndex"`
	Fret             string             `json:"fret" bson:"fret"`
	Position         int                `json:"position" bson:"position"`
	AbsolutePosition int                `json:"absolutePosition" bson:"absolutePosition"`
	Type             string             `json:"type,omitempty" bson:"type,omitempty"`
}
