package com.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class RESTcontroller {
    
    @GetMapping("/test")
    public String testing(){
        return "Spring boot is working and test returns this string";
    }
}
