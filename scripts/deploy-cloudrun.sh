#!/usr/bin/env bash
# Build from source with Cloud Build and deploy to Cloud Run in the kronagent
# project. Secrets are read from Secret Manager; see "Deploying" in README.md.
set -euo pipefail

PROJECT="${PROJECT:-kronagent}"
REGION="${REGION:-us-east4}"
SERVICE="${SERVICE:-youtube-learn}"
SQL_INSTANCE="${SQL_INSTANCE:-kronagent:us-east4:youtube-learn-pg}"
RUNTIME_SA="${RUNTIME_SA:-youtube-learn-vertex@kronagent.iam.gserviceaccount.com}"

# Build the canonical <service>-<project number>.<region>.run.app URL rather
# than reading status.url: Cloud Run also answers on a legacy hostname, and
# whichever one the API reports is the one NextAuth hands Google as
# redirect_uri. When that is the unregistered hostname, every sign-in fails
# with redirect_uri_mismatch.
PROJECT_NUMBER="$(gcloud projects describe "$PROJECT" --format='value(projectNumber)')"
URL="https://${SERVICE}-${PROJECT_NUMBER}.${REGION}.run.app"

ENV_VARS="GOOGLE_GENAI_USE_VERTEXAI=true,GOOGLE_CLOUD_PROJECT=$PROJECT,GOOGLE_CLOUD_LOCATION=global,NEXTAUTH_URL=$URL,APP_URL=$URL"

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

echo "Deployed to $URL"
