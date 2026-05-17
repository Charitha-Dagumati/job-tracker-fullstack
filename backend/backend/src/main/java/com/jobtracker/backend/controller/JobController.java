package com.jobtracker.backend.controller;

import com.jobtracker.backend.entity.Job;
import com.jobtracker.backend.service.JobService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    // ================= ADD JOB =================
    @PostMapping
    public Job addJob(@RequestBody Job job) {

        String username = getCurrentUsername();
        job.setUsername(username);

        return jobService.addJob(job);
    }

    // ================= GET ALL JOBS =================
    @GetMapping
    public List<Job> getAllJobs() {
        return jobService.getAllJobs();
    }

    // ================= GET USER JOBS =================
    @GetMapping("/user")
    public List<Job> getJobsByUser() {

        String username = getCurrentUsername();

        return jobService.getJobsByUser(username);
    }

    // ================= UPDATE JOB =================
    @PutMapping("/{id}")
    public Job updateJob(@PathVariable Long id, @RequestBody Job job) {
        return jobService.updateJob(id, job);
    }

    // ================= DELETE JOB =================
    @DeleteMapping("/{id}")
    public void deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
    }

    // ================= UTILITY METHOD =================
    private String getCurrentUsername() {
        return SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();
    }
}