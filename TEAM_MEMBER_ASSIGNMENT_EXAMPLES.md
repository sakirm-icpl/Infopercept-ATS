# Team Member Assignment Examples

## 🎯 **Flexible Interview Stage Assignment System**

The ATS now supports **complete flexibility** in assigning any user type to any interview stage. Here are comprehensive examples:

## 📋 **Interview Stages Overview**

1. **Stage 1: HR Screening** - Initial assessment with MCQ test
2. **Stage 2: Practical Lab Test** - Technical skills evaluation  
3. **Stage 3: Technical Interview** - In-depth technical discussion
4. **Stage 4: HR Round** - Cultural fit and soft skills assessment
5. **Stage 5: BU Lead Interview** - Business unit specific evaluation
6. **Stage 6: CEO Interview** - Final executive review

## 👥 **User Types Available for Assignment**

### **HR Users**
- Can be assigned to ANY stage
- Have full HR permissions
- Can approve/reject other team member feedback

### **Team Members**
- Can be assigned to ANY stage
- Specialized in specific areas (technical, soft skills, etc.)
- Submit feedback for HR review

### **Admin Users**
- Can conduct any stage directly
- Can override any assignment
- Full system access

## 🔄 **Assignment Scenarios**

### **Scenario 1: Traditional HR-Led Process**
```
Stage 1: HR Screening → HR User (Muskan)
Stage 2: Practical Lab → HR User (Vidhi) 
Stage 3: Technical Interview → HR User (Komal)
Stage 4: HR Round → HR User (Nikita)
Stage 5: BU Lead Interview → HR User (Muskan)
Stage 6: CEO Interview → HR User (Vidhi)
```

### **Scenario 2: Mixed HR + Team Member Process**
```
Stage 1: HR Screening → HR User (Muskan)
Stage 2: Practical Lab → Team Member (Tech Expert)
Stage 3: Technical Interview → Team Member (Senior Developer)
Stage 4: HR Round → HR User (Nikita)
Stage 5: BU Lead Interview → Team Member (BU Lead)
Stage 6: CEO Interview → HR User (Vidhi)
```

### **Scenario 3: Team Member Specialized Process**
```
Stage 1: HR Screening → Team Member (HR Specialist)
Stage 2: Practical Lab → Team Member (Technical Lead)
Stage 3: Technical Interview → Team Member (Architect)
Stage 4: HR Round → Team Member (Culture Specialist)
Stage 5: BU Lead Interview → Team Member (BU Manager)
Stage 6: CEO Interview → Team Member (Senior Executive)
```

### **Scenario 4: Role-Based Specialization**
```
Stage 1: HR Screening → HR User (Initial screening)
Stage 2: Practical Lab → Team Member (Technical skills)
Stage 3: Technical Interview → Team Member (Deep technical)
Stage 4: HR Round → HR User (Cultural fit)
Stage 5: BU Lead Interview → Team Member (Business alignment)
Stage 6: CEO Interview → Admin/HR (Final decision)
```

## 🛠️ **API Usage Examples**

### **Get Available Interviewers**
```bash
GET /api/applications/available-interviewers
```
Returns all HR users and Team Members available for assignment.

### **Assign Stage to Team Member**
```bash
POST /api/applications/{application_id}/assign-stage
{
  "stage_number": 3,
  "assigned_to": "team_member_user_id",
  "notes": "Technical interview for backend position"
}
```

### **Assign Stage to HR User**
```bash
POST /api/applications/{application_id}/assign-stage
{
  "stage_number": 1,
  "assigned_to": "hr_user_id", 
  "notes": "Initial HR screening"
}
```

## 📊 **Assignment Matrix**

| Stage | Can be assigned to | Typical Assignee | Purpose |
|-------|-------------------|------------------|---------|
| Stage 1 | HR, Team Member | HR User | Initial screening & MCQ |
| Stage 2 | HR, Team Member | Team Member | Technical skills test |
| Stage 3 | HR, Team Member | Team Member | Deep technical interview |
| Stage 4 | HR, Team Member | HR User | Cultural fit assessment |
| Stage 5 | HR, Team Member | Team Member | Business unit alignment |
| Stage 6 | HR, Team Member | HR/Admin | Final executive review |

## 🔐 **Permission Matrix**

| User Role | Can Assign | Can Conduct | Can Approve | Can Reject |
|-----------|------------|-------------|-------------|------------|
| Admin | ✅ All stages | ✅ All stages | ✅ All stages | ✅ All stages |
| HR | ✅ All stages | ✅ All stages | ✅ All stages | ✅ All stages |
| Team Member | ❌ None | ✅ Assigned only | ❌ None | ❌ None |
| Candidate | ❌ None | ❌ None | ❌ None | ❌ None |

## 🎯 **Key Benefits**

1. **Complete Flexibility**: Any user type can be assigned to any stage
2. **Role Specialization**: Team members can focus on their expertise areas
3. **Workload Distribution**: HR can delegate interviews to reduce workload
4. **Quality Control**: HR maintains oversight and approval rights
5. **Scalability**: Easy to add new team members and assign them to stages

## 🚀 **Implementation Status**

✅ **Backend API** - Complete
✅ **Database Models** - Complete  
✅ **Frontend Components** - Complete
✅ **Role-based Access** - Complete
✅ **Assignment System** - Complete
✅ **Feedback Workflow** - Complete

The system is now **fully functional** and supports assigning any user type to any interview stage! 