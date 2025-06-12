package com.sgsm.backend.dto;

public class DashboardDTO {
    private int projectCount;
    private int totalTasks;
    private int todoCount;
    private int inProgressCount;
    private int doneCount;
    private int lateCount;

    public DashboardDTO() {}

    public DashboardDTO(int projectCount, int totalTasks, int todoCount, int inProgressCount, int doneCount, int lateCount) {
        this.projectCount = projectCount;
        this.totalTasks = totalTasks;
        this.todoCount = todoCount;
        this.inProgressCount = inProgressCount;
        this.doneCount = doneCount;
        this.lateCount = lateCount;
    }

    public int getProjectCount() { return projectCount; }
    public void setProjectCount(int projectCount) { this.projectCount = projectCount; }

    public int getTotalTasks() { return totalTasks; }
    public void setTotalTasks(int totalTasks) { this.totalTasks = totalTasks; }

    public int getTodoCount() { return todoCount; }
    public void setTodoCount(int todoCount) { this.todoCount = todoCount; }

    public int getInProgressCount() { return inProgressCount; }
    public void setInProgressCount(int inProgressCount) { this.inProgressCount = inProgressCount; }

    public int getDoneCount() { return doneCount; }
    public void setDoneCount(int doneCount) { this.doneCount = doneCount; }

    public int getLateCount() { return lateCount; }
    public void setLateCount(int lateCount) { this.lateCount = lateCount; }
}
