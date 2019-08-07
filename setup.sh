#!/bin/bash

while true; do
    read -p "Enter name of the project: " project_name
    if [ -z "$project_name" ]; then
        echo "Enter valid project name"
    else
        break;
    fi
done
while true; do
    read -p "Enter id for the project: " project_id
    if [ -z "$project_id" ]; then
        echo "Enter valid project id"
    else
        break;
    fi
done

echo "Creating project '$project_name'"
git grep -l __APP_ID__ -- :^setup.sh | xargs sed -i "s/__APP_ID__/$project_id/g"
git grep -l __APP_NAME__ -- :^setup.sh | xargs sed -i "s/__APP_NAME__/$project_name/g"
