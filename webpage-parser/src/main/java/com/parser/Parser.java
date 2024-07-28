package com.parser;

import java.io.FileInputStream;
import java.util.ArrayList;
import java.io.File;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.parser.AutoDetectParser;
import org.apache.tika.parser.ParseContext;
import org.apache.tika.sax.BodyContentHandler;
import org.apache.tika.sax.boilerpipe.BoilerpipeContentHandler;

import com.backend.model.IndexData;


public class Parser {
    private static ArrayList<IndexData> result = new ArrayList<>();

    public static IndexData parseDoc(String fileName) {
        try {
            BodyContentHandler handler = new BodyContentHandler(); 
            Metadata metadata = new Metadata();
            FileInputStream inputStream = new FileInputStream(fileName);
            ParseContext parseContext = new ParseContext();
            AutoDetectParser parser = new AutoDetectParser(); 
            parser.parse(inputStream, new BoilerpipeContentHandler(handler), metadata, parseContext);

            IndexData result = new IndexData();
            String content = handler.toString().replaceAll("\\s+"," ");
            if (!content.equals("")){
                result.setContent(content);
            } 

            String[] metadataNames = metadata.names();

            for(String name: metadataNames) {
                if (name.contains("title")) {
                    if (metadata.get(name) != "") {
                        result.setTitle(metadata.get(name));
                    }
                }
            }
            return result;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return new IndexData();
    }

    public static void iterateAndParseFiles(File f, String URLname, String category) {
        File files[];

        if (f.isFile()) {
            IndexData obj = Parser.parseDoc(f.getPath().toString());
            if (obj != null) {
                if (URLname != "") {
                    obj.setURL("https://" + URLname.substring(1));
                }
                obj.setCategory(category);
                Parser.result.add(obj);
            }
        } else {
            files = f.listFiles();
            for (File file : files) {
                if (category == "") {
                    iterateAndParseFiles(file, URLname, file.getName().toString());
                } else {
                    if (file.isFile()) {
                        iterateAndParseFiles(file, URLname, category);
                    } else {
                        iterateAndParseFiles(file, URLname + "/" + file.getName().toString(), category); 
                    }
                }
            }
        }
    }

    public static ArrayList<IndexData> getParsedData() {
        return Parser.result;
    }
}
