package com.backend.model;

import java.util.List;

public class IndexData {
    private String content = "-";
    private String URL = "-";
    private String title = "-";
    private String category = "-";
    private List<String> content_embedding;
    private List<String> title_embedding;

    public IndexData() {}

    public IndexData(String title, String content, String URL) {
        this.title = title;
        this.content = content;
        this.URL = URL;
    }

    public String getContent() {
        return this.content;
    }

    public String getUrl() {
        return this.URL;
    }

    public String getTitle() {
        return this.title;
    }

    public String getCategory() {
        return this.category;
    }

    public List<String> getContent_embedding() {
        return this.content_embedding;
    }

    public List<String> getTitle_embedding() {
        return this.title_embedding;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setURL(String URL) {
        this.URL = URL;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setContent_embedding(List<String> content_embedding) {
        this.content_embedding = content_embedding;
    }

    public void setTitle_embedding(List<String> title_embedding) {
        this.title_embedding = title_embedding;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    @Override
    public String toString() {
        return String.format("IndexData{title='%s', content='%s', URL='%s'}", title, content, URL);
    }
}