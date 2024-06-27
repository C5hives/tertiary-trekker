package com.parser;

import java.io.FileInputStream;
import java.io.File;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.parser.AutoDetectParser;
import org.apache.tika.parser.ParseContext;
import org.apache.tika.sax.BodyContentHandler;
import org.apache.tika.sax.boilerpipe.BoilerpipeContentHandler;
import org.json.JSONObject;
import org.json.JSONArray;

public class Parser {
    private static JSONArray result = new JSONArray();

    public static JSONObject parseDoc(String fileName) {
        try {
            BodyContentHandler handler = new BodyContentHandler(); 
            Metadata metadata = new Metadata();
            FileInputStream inputStream = new FileInputStream(fileName);
            ParseContext parseContext = new ParseContext();
            AutoDetectParser parser = new AutoDetectParser(); 
            parser.parse(inputStream, new BoilerpipeContentHandler(handler), metadata, parseContext);

            JSONObject result = new JSONObject();
            result.put("content", handler.toString().replaceAll("\\s+"," "));

            String[] metadataNames = metadata.names();

            for(String name: metadataNames) {
                if (name.contains("title")) {
                    System.out.println(name + " " + metadata.get(name));
                    result.put("title", metadata.get(name));
                }
            }
            return result;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public static void iterateAndParseFiles(File f, String URLname) {
        File files[];

        if (f.isFile()) {
            JSONObject obj = Parser.parseDoc(f.getPath().toString());
            obj.put("URL", URLname.substring(1));
            Parser.result.put(obj);
        } else {
            files = f.listFiles();
            for (File file : files) {
                iterateAndParseFiles(file, URLname + "/" + file.getName().toString());
            }
        }
    }

    public static JSONArray getParsedDataAsJSON() {
        return Parser.result;
    }
}
