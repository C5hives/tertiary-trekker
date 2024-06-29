package com.backend.controller;

import java.io.IOException;

import org.opensearch.client.opensearch.core.SearchResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.model.IndexData;
import com.backend.service.Service;

@RestController
@RequestMapping("/api")
public class RESTcontroller {
    
    @GetMapping("/test")
    public String testing(){
        return "Spring boot is working and test returns this string";
    }

    @GetMapping("/search")
    public SearchResponse<IndexData> searchQuery(@RequestParam(name = "term") String query) {
        try {
            SearchResponse<IndexData> result = Service.searchTerm(query);
            return result;
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

}
