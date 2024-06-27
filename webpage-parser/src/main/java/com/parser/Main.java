package com.parser;

import java.io.File;

// To remove or maybe do the http request from here to push parsed data in

public class Main {

    static final File cwd = new File("").getAbsoluteFile();
    static final String dirString = cwd.getAbsolutePath() + "\\webpage-parser\\src\\test\\java\\dummyData\\test1.html";
    public static void main(String[] args) {
        System.out.println(dirString);
        System.out.println(Parser.parseDoc(dirString));
    }
}