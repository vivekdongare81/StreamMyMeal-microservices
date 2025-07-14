#!/bin/bash

# StreamMyMeal Microservices Startup Script
# Starts all microservices in order with 3-second delays
# Continues regardless of failures and writes logs to logs folder

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOGS_DIR="$PROJECT_ROOT/setup-local/logs"
DELAY_BETWEEN_SERVICES=3

# Service directories in startup order
SERVICES=(
    "config-server"
    "discovery-server"
    "accounts-service"
    "cards-service"
    "loans-service"
    "messaging-service"
    # "api-gateway"
)

# Create logs directory
mkdir -p "$LOGS_DIR"

# Function to log messages
log_message() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Function to stop a service
stop_service() {
    local service_name="$1"
    local pid_file="$LOGS_DIR/${service_name}.pid"
    
    # Kill by PID file if it exists
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            log_message "Stopping $service_name (PID: $pid)..."
            kill "$pid"
            sleep 2
            # Force kill if still running
            if kill -0 "$pid" 2>/dev/null; then
                log_message "Force killing $service_name..."
                kill -9 "$pid"
            fi
        fi
        rm -f "$pid_file"
    fi
    
    # Also kill by process name as backup
    local pids=$(pgrep -f "$service_name" 2>/dev/null || true)
    if [ -n "$pids" ]; then
        log_message "Stopping existing $service_name processes: $pids"
        echo "$pids" | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
}

# Function to start a service
start_service() {
    local service_name="$1"
    local service_dir="$PROJECT_ROOT/$service_name"
    local log_file="$LOGS_DIR/${service_name}.log"
    
    log_message "Starting $service_name..."
    
    if [ ! -d "$service_dir" ]; then
        log_message "${RED}Error: Service directory $service_dir does not exist${NC}"
        return 1
    fi
    
    # Check if service is already running and stop it
    if pgrep -f "$service_name" > /dev/null; then
        log_message "${YELLOW}Service $service_name is already running. Stopping and restarting...${NC}"
        stop_service "$service_name"
        sleep 2  # Give it time to fully stop
    fi
    
    # Navigate to service directory and start
    cd "$service_dir"
    
    # Unset any environment variables that might interfere with local development
    unset SPRING_CLOUD_STREAM_KAFKA_BINDER_BROKERS
    unset SPRING_PROFILES_ACTIVE
    
    # Set environment variables for local development
    export SPRING_CLOUD_STREAM_KAFKA_BINDER_BROKERS="localhost:9092"
    export SPRING_PROFILES_ACTIVE="local"
    
    log_message "Ensuring Kafka broker is set to localhost:9092 for $service_name"
    
    # Start the service in background and redirect output to log file
    nohup ./mvnw spring-boot:run > "$log_file" 2>&1 &
    local pid=$!
    
    # Store PID for cleanup
    echo $pid > "$LOGS_DIR/${service_name}.pid"
    
    log_message "${GREEN}Started $service_name with PID: $pid${NC}"
    log_message "Logs available at: $log_file"
    
    return 0
}

# Function to cleanup on exit
cleanup() {
    log_message "Cleaning up all services..."
    
    # Kill all background processes from current script
    jobs -p | xargs -r kill 2>/dev/null || true
    
    # Stop all microservices
    for service in "${SERVICES[@]}"; do
        log_message "Stopping $service..."
        stop_service "$service"
    done
    
    # Additional cleanup - kill any remaining Java processes for our services
    for service in "${SERVICES[@]}"; do
        local pids=$(pgrep -f "$service" 2>/dev/null || true)
        if [ -n "$pids" ]; then
            log_message "Force killing remaining $service processes: $pids"
            echo "$pids" | xargs kill -9 2>/dev/null || true
        fi
    done
    
    # Remove PID files
    rm -f "$LOGS_DIR"/*.pid
    
    log_message "Cleanup complete"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Main execution
main() {
    log_message "Starting StreamMyMeal Microservices in order..."
    log_message "Logs directory: $LOGS_DIR"
    log_message "Delay between services: ${DELAY_BETWEEN_SERVICES} seconds"
    log_message ""
    
    for service in "${SERVICES[@]}"; do
        log_message "=========================================="
        log_message "Processing: $service"
        log_message "=========================================="
        
        # Try to start the service
        if start_service "$service"; then
            log_message "${GREEN}Successfully initiated $service${NC}"
        else
            log_message "${RED}Failed to start $service - continuing with next service${NC}"
        fi
        
        # Wait before starting next service (except for the last one)
        if [ "$service" != "${SERVICES[-1]}" ]; then
            log_message "Waiting ${DELAY_BETWEEN_SERVICES} seconds before next service..."
            sleep $DELAY_BETWEEN_SERVICES
        fi
    done
    
    log_message ""
    log_message "=========================================="
    log_message "All services have been initiated"
    log_message "Check logs in: $LOGS_DIR"
    log_message "Use './stop-all-services.sh' to stop all services"
    log_message "=========================================="
    
    # Keep script running
    log_message "Press Ctrl+C to stop all services and exit"
    while true; do
        sleep 10
    done
}

# Run main function
main "$@" 