#!/bin/bash

# Script to clean up application data from ATS system
# Server: 172.17.11.30

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "=========================================="
echo "  ATS Application Data Cleanup"
echo "=========================================="
echo

# Set Docker Compose command
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    DOCKER_COMPOSE="docker compose"
fi

# Menu
echo "Select cleanup option:"
echo "1) Delete ALL applications (keeps users and jobs)"
echo "2) Delete specific application by email"
echo "3) Delete all applications AND related data (assignments, notifications)"
echo "4) Complete database reset (WARNING: Deletes everything except admin user)"
echo "5) Exit"
echo

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        print_warning "This will delete ALL applications"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            print_status "Deleting all applications..."
            $DOCKER_COMPOSE exec -T mongodb mongosh -u admin -p "InfoperceptATS@2024!Secure" --authenticationDatabase admin <<EOF
use ats_production
db.applications.deleteMany({})
print("Applications deleted: " + db.applications.countDocuments({}))
EOF
            print_success "All applications deleted!"
        else
            print_status "Cancelled"
        fi
        ;;
    
    2)
        read -p "Enter candidate email to delete: " email
        print_status "Deleting application for $email..."
        $DOCKER_COMPOSE exec -T mongodb mongosh -u admin -p "InfoperceptATS@2024!Secure" --authenticationDatabase admin <<EOF
use ats_production
db.applications.deleteMany({"email": "$email"})
print("Applications deleted for: $email")
EOF
        print_success "Application deleted!"
        ;;
    
    3)
        print_warning "This will delete ALL applications, assignments, and notifications"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            print_status "Deleting all application data..."
            $DOCKER_COMPOSE exec -T mongodb mongosh -u admin -p "InfoperceptATS@2024!Secure" --authenticationDatabase admin <<EOF
use ats_production
db.applications.deleteMany({})
db.stage_assignments.deleteMany({})
db.notifications.deleteMany({})
db.candidates.deleteMany({})
print("All application data deleted")
print("Applications: " + db.applications.countDocuments({}))
print("Assignments: " + db.stage_assignments.countDocuments({}))
print("Notifications: " + db.notifications.countDocuments({}))
print("Candidates: " + db.candidates.countDocuments({}))
EOF
            print_success "All application data deleted!"
        else
            print_status "Cancelled"
        fi
        ;;
    
    4)
        print_error "⚠️  DANGER: This will delete EVERYTHING except the admin user!"
        print_error "This includes: users, jobs, applications, assignments, notifications"
        echo
        read -p "Type 'DELETE EVERYTHING' to confirm: " confirm
        if [ "$confirm" = "DELETE EVERYTHING" ]; then
            print_status "Performing complete database reset..."
            $DOCKER_COMPOSE exec -T mongodb mongosh -u admin -p "InfoperceptATS@2024!Secure" --authenticationDatabase admin <<EOF
use ats_production

// Keep only admin user
db.users.deleteMany({"email": {"\$ne": "admin@infopercept.com"}})

// Delete all other data
db.jobs.deleteMany({})
db.applications.deleteMany({})
db.stage_assignments.deleteMany({})
db.notifications.deleteMany({})
db.candidates.deleteMany({})

print("Database reset complete!")
print("Remaining users: " + db.users.countDocuments({}))
print("Jobs: " + db.jobs.countDocuments({}))
print("Applications: " + db.applications.countDocuments({}))
EOF
            print_success "Database reset complete! Only admin user remains."
        else
            print_status "Cancelled - confirmation text did not match"
        fi
        ;;
    
    5)
        print_status "Exiting"
        exit 0
        ;;
    
    *)
        print_error "Invalid option"
        exit 1
        ;;
esac

echo
print_success "Cleanup completed! 🧹"
