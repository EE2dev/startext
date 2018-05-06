# startext.js

An animation of text lines based on d3.js and [this amazing codepen from Blake Bowen](https://codepen.io/osublake/pen/RLOzxo).

To use it simply copy [the example from this block](https://bl.ocks.org/ee2dev/66c18f6626e186db0c252a57fceb5327) and adjust the `myIntro` Array.
For example:

```
<!DOCTYPE html>
<html>
    <meta charset="utf-8">
    <head>    
        <title>animated intro</title>
        <link href="https://ee2dev.github.io/startext/lib/startext-v10.css" rel="stylesheet">
        <script src="https://d3js.org/d3.v5.min.js"></script>
        <script src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"></script>
        <script src="https://ee2dev.github.io/startext/lib/startext-v10.min.js"></script> 
    </head>

    <body>
        <aside style="display:none">
            <img id="star-texture" src="https://ee2dev.github.io/startext/lib/stars-02.png">
            <img id="star-texture-white" src="https://ee2dev.github.io/startext/lib/stars-02w.png">
        </aside> 

        <script>
            var myIntro = [];
            var line1 = ["Hello world!", "This is my first animated intro", "made with startext.js"];
            line1.defaultLine = startext.STARS; line1.punchLine = startext.STARS;
            myIntro.push(line1);

            var myChart = startext.chart(myIntro);
            
            d3.select("body")
                .append("div")
                .attr("class", "chart")
                .call(myChart);
        </script>
    </body>
</html>
```

## Installing

If you use NPM, `npm run prepare`.

## Bl.ocks

Some examples which have been build on the way to startext.js are [in the blocks directory](https://github.com/EE2dev/startext/tree/master/blocks).
[Here](https://bl.ocks.org/EE2dev/e01de51772be2cace280a8b6bae30800) is a link to the original blocks.

## License

This code is released under the [BSD License](https://github.com/EE2dev/sequence-explorer//blob/master/LICENSE) 