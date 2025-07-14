#!/bin/bash

# =============================================================================
# StreamMyMeal Local Development Startup Script
# =============================================================================
# This script starts the local development environment:
# 1. Starts Docker infrastructure services
# 2. Starts all microservices locally
# =============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Start Docker infrastructure
start_infrastructure() {
    print_status "Starting Docker infrastructure services..."
    
    cd setup-local || {
        print_error "setup-local directory not found!"
        exit 1
    }
    
    # Start Docker services
    if docker-compose up -d; then
        print_success "Docker infrastructure started successfully"
        cd ..
    else
        print_error "Failed to start Docker infrastructure"
        cd ..
        exit 1
    fi
}

# Wait for infrastructure to be ready
wait_for_infrastructure() {
    print_status "Waiting for infrastructure services to be ready..."
    
    # Wait for databases
    local db_ports=(8084 8085 8086)
    for port in "${db_ports[@]}"; do
        print_status "Waiting for database on port $port..."
        while ! nc -z localhost $port 2>/dev/null; do
            sleep 2
        done
        print_success "Database on port $port is ready"
    done
    
    # Wait for Kafka
    print_status "Waiting for Kafka..."
    while ! nc -z localhost 9092 2>/dev/null; do
        sleep 2
    done
    print_success "Kafka is ready"
    
    # Wait for RabbitMQ
    print_status "Waiting for RabbitMQ..."
    while ! nc -z localhost 5672 2>/dev/null; do
        sleep 2
    done
    print_success "RabbitMQ is ready"
    
    # Wait for Redis
    print_status "Waiting for Redis..."
    while ! nc -z localhost 6379 2>/dev/null; do
        sleep 2
    done
    print_success "Redis is ready"
    
    print_success "All infrastructure services are ready!"
}

# Start microservices
start_microservices() {
    print_status "Starting microservices..."
    
    cd setup-local || {
        print_error "setup-local directory not found!"
        exit 1
    }
    
    # Make script executable and run it
    chmod +x start-all-services.sh
    ./start-all-services.sh
    
    cd ..
}

# Main execution
main() {
    print_status "Starting StreamMyMeal Local Development Environment..."
    
    # Check prerequisites
    check_docker
    
    # Start infrastructure
    start_infrastructure
    
    # Wait for infrastructure
    wait_for_infrastructure
    
    # Start microservices
    start_microservices
}

# Run main function
main "$@" 