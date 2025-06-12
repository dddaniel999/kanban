package com.sgsm.backend.dto;

public class ManagerDashboardDTO {
    private int managedProjects;
    private int totalMembers;
    private int totalTasks;
    private int todoCount;
    private int inProgressCount;
    private int doneCount;
    private int lateCount;

    public ManagerDashboardDTO() {}

    public ManagerDashboardDTO(int managedProjects, int totalMembers, int totalTasks, int todoCount, int inProgressCount, int doneCount, int lateCount) {
        this.managedProjects = managedProjects;
        this.totalMembers = totalMembers;
        this.totalTasks = totalTasks;
        this.todoCount = todoCount;
        this.inProgressCount = inProgressCount;
        this.doneCount = doneCount;
        this.lateCount = lateCount;
    }

    public int getManagedProjects() {
        return managedProjects;
    }

    public void setManagedProjects(int managedProjects) {
        this.managedProjects = managedProjects;
    }

    public int getTotalMembers() {
        return totalMembers;
    }

    public void setTotalMembers(int totalMembers) {
        this.totalMembers = totalMembers;
    }

    public int getTotalTasks() {
        return totalTasks;
    }

    public void setTotalTasks(int totalTasks) {
        this.totalTasks = totalTasks;
    }

    public int getTodoCount() {
        return todoCount;
    }

    public void setTodoCount(int todoCount) {
        this.todoCount = todoCount;
    }

    public int getInProgressCount() {
        return inProgressCount;
    }

    public void setInProgressCount(int inProgressCount) {
        this.inProgressCount = inProgressCount;
    }

    public int getDoneCount() {
        return doneCount;
    }

    public void setDoneCount(int doneCount) {
        this.doneCount = doneCount;
    }

    public int getLateCount() {
        return lateCount;
    }

    public void setLateCount(int lateCount) {
        this.lateCount = lateCount;
    }
}
