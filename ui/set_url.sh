#!/bin/sh

# Read environment variables
ENV_BACKEND_HOST=$1

# Debug output (optional)
echo "Backend Host: ${ENV_BACKEND_HOST}"

# Replace placeholders in the Nginx config file
find /etc/nginx/conf.d/default.conf -type f -print0 | xargs -0 sed -i -e "s|<ENV_BACKEND_HOST>|${ENV_BACKEND_HOST}|g"
