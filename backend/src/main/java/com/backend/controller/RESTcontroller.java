package com.backend.controller;

import java.io.IOException;
import java.util.ArrayList;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.model.queryData;
import com.backend.service.Service;

@CrossOrigin
@RestController
@RequestMapping("/api")
public class RESTcontroller {
        
    @GetMapping("/test")
    public String testing(){
        return "Spring boot is working and test returns this string";
    }

    @GetMapping("/search")
    public ResponseEntity<ArrayList<queryData>> searchQuery(@RequestParam(name = "term") String query) {
        try {
            ArrayList<queryData> result = Service.searchTerm(query);
            
            return new ResponseEntity<ArrayList<queryData>>(result, HttpStatus.ACCEPTED);
        } catch (IOException e) {
            e.printStackTrace();
        }
        return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }

    @GetMapping("/MLTsearch")
    public ResponseEntity<ArrayList<queryData>> searchSimilarQuery(@RequestParam(name = "id") String query) {
        try {
            ArrayList<queryData> result = Service.searchMLTTerm(query);
            
            return new ResponseEntity<ArrayList<queryData>>(result, HttpStatus.ACCEPTED);
        } catch (IOException e) {
            e.printStackTrace();
        }
        return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }

}
