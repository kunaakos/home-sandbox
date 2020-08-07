#!/bin/bash
set -e
mongo <<EOF
use $HSB__MONGO_DBNAME

db.createUser({
  user: '$HSB__MONGO_USERNAME',
  pwd: '$HSB__MONGO_PASSWORD',
  roles: [
    {
      role: 'readWrite',
      db: '$HSB__MONGO_DBNAME',
    },
  ],
})

db.passwords.createIndex( { "username": 1 }, { unique: true } )

db.passwords.insertOne({
	_id: "default-user",
	"username" : "$HSB__DEFAULTUSER_USERNAME",
	"hash" : "$HSB__DEFAULTUSER_PASSWORD",
	"updatedAt": 0
})

db.users.createIndex( { "username": 1 }, { unique: true } )

db.users.insertOne({
	"_id" : "default-user",
    "username" : "$HSB__DEFAULTUSER_USERNAME",
    "displayName" : "Default User",
    "permissions" : ["addusers", "modifysettings"]
})

EOF
