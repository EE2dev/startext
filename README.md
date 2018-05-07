# startext.js

An animation of text lines based on d3.js and [this amazing codepen from Blake Bowen](https://codepen.io/osublake/pen/RLOzxo).

If you want to use it with your text, simply copy [the example from this block](https://bl.ocks.org/ee2dev/66c18f6626e186db0c252a57fceb5327) and adjust the `myIntro` array.
It contains pages with text lines which will be animated.
The `myIntro` array is an array of array of strings. Each array of strings is displayed on one page. Each string is animated on one line.
For example:

```
<!DOCTYPE html>
<html>
    <meta charset="utf-8">
    <head>    
        <title>animated intro</title>
        <link href="https://ee2dev.github.io/startext/lib/startext-v11.css" rel="stylesheet">
        <script src="https://d3js.org/d3.v5.min.js"></script>
        <script src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"></script>
        <script src="https://ee2dev.github.io/startext/lib/startext-v11.min.js"></script> 
    </head>

    <body>
        <aside style="display:none">
            <img id="star-texture" src="https://ee2dev.github.io/startext/lib/stars-02.png">
            <img id="star-texture-white" src="https://ee2dev.github.io/startext/lib/stars-02w.png">
        </aside> 

        <script>
            var myIntro = [];
            var page1 = ["Hello world!", "This is my first animated intro", "made with startext.js"];
            page1.defaultLine = startext.STARS;
            myIntro.push(page1);

            var myChart = startext.chart(myIntro);
            
            d3.select("body")
                .append("div")
                .attr("class", "chart")
                .call(myChart);
        </script>
    </body>
</html>
```

## API for startext.js
function | parameter | explanation
------------ | -------|------
`background()` | *integer* | e.g. `startext.chart(myIntro).background(startext.IMAGE)`. The default is startext.COLOR.
`backgroundColor()` | *string* | e.g. `startext.chart(myIntro).backgroundColor("#000")`. The default is "#111111".
`explosionStrength()` | *integer* | e.g. `startext.chart(myIntro).explosionStrength(0.005)`. The default is 0.01 (for IE) and 0.002 otherwise.
`replay()` | *boolean* | e.g. `startext.chart(myIntro).replay(false)`. The default is true.
`pause()` | *integer* | e.g. `startext.chart(myIntro).pause(3000)`. The pause in between pages in milliseconds. The default is 5000.
`transitionSpeed()` | *integer* | e.g. `startext.chart(myIntro).transitionSpeed(2)`. The default is 7.

## Installing

If you use NPM, `npm run prepare`.

## Bl.ocks

Some examples which have been build on the way to startext.js are [in the blocks directory](https://github.com/EE2dev/startext/tree/master/blocks). The link to the original blocks is
https://bl.ocks.org/EE2dev/e01de51772be2cace280a8b6bae30800.

## License

This code is released under the [BSD License](https://github.com/EE2dev/sequence-explorer//blob/master/LICENSE) 