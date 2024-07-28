package com.backend.model;

public class queryData {
    private String content = "-";
    private String URL = "-";
    private String title = "-";
    private String category = "-";
    private String id = "-";

    public queryData() {}

    public queryData(String title, String content, String URL) {
        this.title = title;
        this.content = content;
        this.URL = URL;
        this.id = URL.replaceAll("[^a-zA-Z0-9\\s]", "-");
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

    public String getID() {
        return this.id;
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

    public void setCategory(String category) {
        this.category = category;
    }

    public void setID(String id) {
        this.id = id;
    }

    @Override
    public String toString() {
        return String.format("IndexData{title='%s', content='%s', URL='%s'}", title, content, URL);
    }
}