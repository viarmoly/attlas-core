#!/bin/bash -e
export $(cat ./../../.env | grep -v ^# | xargs)
ng build --prod --env=prod
