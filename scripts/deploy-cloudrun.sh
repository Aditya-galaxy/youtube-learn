#!/usr/bin/env bash
# Build from source with Cloud Build and deploy to Cloud Run in the kronagent
# project. Secrets are read from Secret Manager; see "Deploying" in README.md.
set -euo pipefail

PROJECT="${PROJECT:-kronagent}"
REGION="${REGION:-us-east4}"
SERVICE="${SERVICE:-youtube-learn}"
SQL_INSTANCE="${SQL_INSTANCE:-kronagent:us-east4:youtube-learn-pg}"
RUNTIME_SA="${RUNTIME_SA:-youtube-learn-vertex@kronagent.iam.gserviceaccount.com}"

# The public URL is stable once the service exists; the first deploy falls
# back to NEXTAUTH_URL being filled in by a second run.
URL="$(gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" \
  --format='value(status.url)' 2>/dev/null || true)"

ENV_VARS="GOOGLE_GENAI_USE_VERTEXAI=true,GOOGLE_CLOUD_PROJECT=$PROJECT,GOOGLE_CLOUD_LOCATION=global"
if [[ -n "$URL" ]]; then
  ENV_VARS="$ENV_VARS,NEXTAUTH_URL=$URL,APP_URL=$URL"
fi

# --no-cpu-throttling: the job worker answers 202 and keeps running its step in
# after(); with request-based CPU it would be throttled to near zero.
gcloud run deploy "$SERVICE" \
  --project "$PROJECT" \
  --region "$REGION" \
  --source . \
  --service-account "$RUNTIME_SA" \
  --add-cloudsql-instances "$SQL_INSTANCE" \
  --no-cpu-throttling \
  --timeout 600 \
  --memory 1Gi \
  --min-instances 0 \
  --max-instances 3 \
  --allow-unauthenticated \
  --set-env-vars "$ENV_VARS" \
  --set-secrets "DATABASE_URL=ytlearn-database-url:latest,DIRECT_URL=ytlearn-database-url:latest,NEXTAUTH_SECRET=ytlearn-nextauth-secret:latest,GOOGLE_CLIENT_ID=ytlearn-google-client-id:latest,GOOGLE_CLIENT_SECRET=ytlearn-google-client-secret:latest,YOUTUBE_API_KEY=ytlearn-youtube-api-key:latest,JOB_RUNNER_SECRET=ytlearn-job-runner-secret:latest"

if [[ -z "$URL" ]]; then
  echo "First deploy done. Run this script once more so NEXTAUTH_URL and APP_URL point at the service URL."
fi
