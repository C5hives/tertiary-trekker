import static org.junit.Assert.assertEquals;

import java.io.File;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.Test;

import com.parser.Parser;

public class ParserTest {

    //To get working directory
    private final File cwd = new File("").getAbsoluteFile();
    //To add the subsequent file structure for the test data
    private final String cwdString = cwd.getAbsolutePath() + "\\src\\test\\java\\dummyData";

    //Test on the one html file without header or footer
    @Test
    public void testParseDoc() {
        //Parsing only the first test html file
        JSONObject result = Parser.parseDoc(cwdString + "\\test1.html");

        JSONObject expected = new JSONObject();
        expected.put("title", "Spoon-Knife");
        expected.put("content", "Lorem Ipsum dolor set amet.... "
        + "this is content that I want to be read as the body/content by boilerpipe. "
        + "this is random text in another paragraph. ");

        assertEquals( expected.toString(), result.toString());
    }

    //Test on the all html file in folder with extra data as header and footer
    @Test
    public void testParseAllDoc() {
        //Output that is expected of each html file
        String contentString = "Lorem Ipsum dolor set amet.... "
        + "this is content that I want to be read as the body/content by boilerpipe. "
        + "this is random text in another paragraph. ";

        //All test will have the same output with different inputs to test boilerpipe's filtering when parsing
        //Loop to generate the multiple expected outputs
        JSONArray expected = new JSONArray();
        for (int i = 1; i < 5; i++) {
            JSONObject obj = new JSONObject();
            obj.put("title", "Spoon-Knife");
            obj.put("content", contentString);
            obj.put("URL", "test" + i +".html");
            expected.put(obj);
        }

        //Function call on the directory to parse all results
        Parser.iterateAndParseFiles(new File(cwdString), "");
        JSONArray result = Parser.getParsedDataAsJSON();

        //convert to String so test is able to compare properly
        assertEquals(expected.toString(), result.toString());
    }
}
