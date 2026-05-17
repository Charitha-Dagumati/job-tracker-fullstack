package com.jobtracker.backend.service;

import com.jobtracker.backend.entity.Job;
import com.jobtracker.backend.repository.JobRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobService {

    private final JobRepository jobRepository;

    public JobService(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    public Job addJob(Job job) {
        return jobRepository.save(job);
    }

    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    public List<Job> getJobsByUser(String username) {
        if (username == null || username.isEmpty()) {
            return List.of();
        }
        return jobRepository.findByUsername(username);
    }

    public Job updateJob(Long id, Job job) {
        return jobRepository.findById(id)
                .map(existing -> {
                    existing.setTitle(job.getTitle());
                    existing.setCompany(job.getCompany());
                    existing.setLocation(job.getLocation());
                    existing.setStatus(job.getStatus());
                    existing.setNotes(job.getNotes());
                    existing.setApplyLink(job.getApplyLink());
                    return jobRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Job not found"));
    }

    public void deleteJob(Long id) {
        if (!jobRepository.existsById(id)) {
            throw new RuntimeException("Job not found");
        }
        jobRepository.deleteById(id);
    }
}