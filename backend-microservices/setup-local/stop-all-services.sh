#!/bin/bash

# =============================================================================
# StreamMyMeal Stop All Services Script
# =============================================================================
# This script stops all running microservices
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

# Function to stop services by PID files
stop_by_pid_files() {
    print_status "Stopping services by PID files..."
    
    local stopped_count=0
    
    for pid_file in *.pid; do
        if [ -f "$pid_file" ]; then
            local service_name=$(basename "$pid_file" .pid)
            local pid=$(cat "$pid_file")
            
            if kill -0 "$pid" 2>/dev/null; then
                print_status "Stopping $service_name (PID: $pid)..."
                kill "$pid"
                sleep 2
                if kill -0 "$pid" 2>/dev/null; then
                    print_warning "Force killing $service_name..."
                    kill -9 "$pid"
                fi
                print_success "$service_name stopped"
                stopped_count=$((stopped_count + 1))
            else
                print_warning "$service_name (PID: $pid) is not running"
            fi
            
            rm -f "$pid_file"
        fi
    done
    
    if [ $stopped_count -gt 0 ]; then
        print_success "Stopped $stopped_count services via PID files"
    else
        print_warning "No services found via PID files"
    fi
}

# Function to stop services by port
stop_by_ports() {
    print_status "Stopping services by port scanning..."
    
    local ports=(8080 8081 8082 8083 8090 8092 8093)
    local stopped_count=0
    
    for port in "${ports[@]}"; do
        local pid=$(lsof -ti :$port 2>/dev/null)
        if [ ! -z "$pid" ]; then
            print_status "Found process on port $port (PID: $pid), stopping..."
            kill "$pid"
            sleep 1
            if kill -0 "$pid" 2>/dev/null; then
                print_warning "Force killing process on port $port..."
                kill -9 "$pid"
            fi
            print_success "Stopped process on port $port"
            stopped_count=$((stopped_count + 1))
        fi
    done
    
    if [ $stopped_count -gt 0 ]; then
        print_success "Stopped $stopped_count processes via port scanning"
    else
        print_warning "No processes found on microservice ports"
    fi
}

# Function to stop Java processes by name
stop_java_processes() {
    print_status "Stopping Java processes by name..."
    
    local services=("config-server" "discovery-server" "accounts-service" "cards-service" "loans-service" "messaging-service" "api-gateway")
    local stopped_count=0
    
    for service in "${services[@]}"; do
        local pids=$(pgrep -f "spring-boot:run.*$service" 2>/dev/null)
        if [ ! -z "$pids" ]; then
            print_status "Found $service processes: $pids"
            echo "$pids" | while read pid; do
                print_status "Stopping $service (PID: $pid)..."
                kill "$pid"
                sleep 1
                if kill -0 "$pid" 2>/dev/null; then
                    print_warning "Force killing $service (PID: $pid)..."
                    kill -9 "$pid"
                fi
                print_success "$service stopped"
                stopped_count=$((stopped_count + 1))
            done
        fi
    done
    
    if [ $stopped_count -gt 0 ]; then
        print_success "Stopped $stopped_count Java processes"
    else
        print_warning "No Java microservice processes found"
    fi
}

# Function to show running services
show_running_services() {
    print_status "Checking for running microservices..."
    
    local ports=(8080 8081 8082 8083 8090 8092 8093)
    local running_count=0
    
    echo "Port  Service           Status"
    echo "----  -------          ------"
    
    for port in "${ports[@]}"; do
        local service_name=""
        case $port in
            8080) service_name="API Gateway" ;;
            8081) service_name="Accounts Service" ;;
            8082) service_name="Cards Service" ;;
            8083) service_name="Loans Service" ;;
            8090) service_name="Config Server" ;;
            8092) service_name="Eureka Server" ;;
            8093) service_name="Messaging Service" ;;
        esac
        
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo "$port   $service_name    RUNNING"
            running_count=$((running_count + 1))
        else
            echo "$port   $service_name    STOPPED"
        fi
    done
    
    echo ""
    if [ $running_count -gt 0 ]; then
        print_warning "$running_count services are still running"
    else
        print_success "All microservices are stopped"
    fi
}

# Function to force stop all
force_stop_all() {
    print_status "Force stopping all microservices..."
    
    # Kill all Java processes (be careful!)
    local java_pids=$(pgrep -f "spring-boot:run" 2>/dev/null)
    if [ ! -z "$java_pids" ]; then
        print_status "Force killing all Spring Boot processes..."
        echo "$java_pids" | xargs kill -9 2>/dev/null
        print_success "Force stopped all Spring Boot processes"
    fi
    
    # Kill processes on microservice ports
    local ports=(8080 8081 8082 8083 8090 8092 8093)
    for port in "${ports[@]}"; do
        local pid=$(lsof -ti :$port 2>/dev/null)
        if [ ! -z "$pid" ]; then
            print_status "Force killing process on port $port..."
            kill -9 "$pid" 2>/dev/null
        fi
    done
    
    # Clean up PID files
    rm -f *.pid 2>/dev/null
    
    print_success "Force stop completed"
}

# Main execution
main() {
    print_status "StreamMyMeal Service Stopper"
    print_status "============================"
    
    case "${1:-help}" in
        "pid")
            stop_by_pid_files
            ;;
        "port")
            stop_by_ports
            ;;
        "java")
            stop_java_processes
            ;;
        "force")
            force_stop_all
            ;;
        "status")
            show_running_services
            ;;
        "all")
            print_status "Stopping all services using all methods..."
            stop_by_pid_files
            stop_by_ports
            stop_java_processes
            show_running_services
            ;;
        "help"|*)
            echo "StreamMyMeal Service Stopper"
            echo "=========================="
            echo ""
            echo "Usage: $0 [METHOD]"
            echo ""
            echo "Methods:"
            echo "  pid     - Stop services using PID files"
            echo "  port    - Stop services by scanning ports"
            echo "  java    - Stop Java processes by name"
            echo "  force   - Force stop all (use with caution)"
            echo "  status  - Show running services"
            echo "  all     - Use all methods to stop services"
            echo "  help    - Show this help"
            echo ""
            echo "Examples:"
            echo "  $0 all      # Stop using all methods"
            echo "  $0 status   # Check what's running"
            echo "  $0 force    # Force stop everything"
            ;;
    esac
}

# Run main function
main "$@" 