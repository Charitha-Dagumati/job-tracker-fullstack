package com.jobtracker.backend.controller;

import com.jobtracker.backend.entity.Job;
import com.jobtracker.backend.service.JobService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "http://localhost:3000")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @PostMapping
    public Job addJob(@RequestBody Job job) {
        if (job.getUsername() == null) {
            throw new RuntimeException("Username missing from request");
        }
        return jobService.addJob(job);
    }

    @GetMapping
    public List<Job> getAllJobs() {
        return jobService.getAllJobs();
    }

    @GetMapping("/user")
    public List<Job> getJobsByUser(@RequestParam String username) {
        return jobService.getJobsByUser(username);
    }

    @PutMapping("/{id}")
    public Job updateJob(@PathVariable Long id, @RequestBody Job job) {
        return jobService.updateJob(id, job);
    }

    @DeleteMapping("/{id}")
    public void deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
    }
}