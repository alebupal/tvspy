#!/bin/bash

# start db
init_db.sh

exec supervisord -n
