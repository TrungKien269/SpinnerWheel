function initiateWheel(containerId, data, angleRotation) {
    var padding = { top: 20, right: 40, bottom: 0, left: 0 },
        // w = 500 - padding.left - padding.right,
        // h = 500 - padding.top - padding.bottom,
        w = 700 - padding.left - padding.right,
        h = 700 - padding.top - padding.bottom,
        r = Math.min(w, h) / 2,
        rotation = 0,
        oldrotation = angleRotation,
        picked = 100000,
        oldpick = [],
        color = d3.scale.category20();

    var svg = d3.select(`#${containerId}`)
        .append("svg")
        .data([data])
        .attr("width", w + padding.left + padding.right)
        .attr("height", h + padding.top + padding.bottom)
        .attr("style", "margin-left:50%;transform:translateX(-50%)");
    var container = svg.append("g")
        .attr("class", "chartholder")
        .attr("transform", "translate(" + (w / 2 + padding.left) + "," + (h / 2 + padding.top) + ")");
    var vis = container
        .append("g");

    var pie = d3.layout.pie().sort(null).value(function (d) { return 1; });
    // declare an arc generator function
    var arc = d3.svg.arc().outerRadius(r);
    // select paths, use arc generator to draw
    var arcs = vis.selectAll("g.slice")
        .data(pie)
        .enter()
        .append("g")
        .attr("class", "slice");

    arcs.append("path")
        .attr("fill", function (d, i) { return color(i); })
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .attr("d", function (d) { return arc(d); });
    // // add the text
    // arcs.append("text").attr("transform", function (d) {
    //     d.innerRadius = 0;
    //     d.outerRadius = r;
    //     d.angle = (d.startAngle + d.endAngle) / 2;
    //     return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")translate(" + (d.outerRadius - 10) + ")";
    // })
    //     .attr("text-anchor", "end")
    //     .text(function (d, i) {
    //         return data[i].text;
    //     });
    // add image
    arcs.append("svg:image")
        .attr("transform", function (d) {
            d.innerRadius = 0;
            d.outerRadius = r;
            d.angle = (d.startAngle + d.endAngle) / 2;
            // return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")translate(" + (d.outerRadius - 100) + ", "  + (d.outerRadius - 255) + ")";
            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")translate(" + (d.outerRadius - 165) + ", " + (d.outerRadius - 378) + ")";
        })
        // .attr("width", "50")
        // .attr("height", "50")
        .attr("width", "100")
        .attr("height", "100")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("xlink:href", function (d, i) {
            return data[i].image;
        });

    //make arrow
    svg.append("g")
        .attr("transform", "translate(" + (w + padding.left + padding.right - 10) + "," + ((h / 2) + padding.top) + ")")
        .append("path")
        .attr("d", "M-" + (r * .15 + 5) + ",0L0," + (r * .05 + 5) + "L0,-" + (r * .05 + 5) + "Z")
        .attr("stroke", "black")
        .style({ "fill": "#ffc90e" });
    //draw spin circle
    container.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 40)
        .attr("id", "spin-button")
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .style({ "fill": "rgb(61 61 61)", "cursor": "pointer" });
    //spin text
    container.append("text")
        .attr("x", 0)
        .attr("y", '0.45vw')
        .attr("text-anchor", "middle")
        .text("QUAY")
        .style({ "font-weight": "bold", "font-size": "20px", "fill": "white" });

    d3.select("#spin-button").on('click', spin);

    // Set angle rotation
    vis.attr("transform", `rotate(${angleRotation})`);


    function spin(d) {
        container.on("click", null);
        // all slices have been seen, all done
        if (oldpick.length == data.length) {
            console.log("done");
            container.on("click", null);
            return;
        }
        var ps = 360 / data.length,
            pieslice = Math.round(1440 / data.length),
            // rng = Math.floor((Math.random() * 1440) + 360);
            // rng = Math.floor(((random(1, 4) / 10 + 5) * 1440) + 360);
            // rng = Math.floor(((Math.random() + 2) * 360) + 360);
            rng = Math.floor(((Math.random() + 10) * 360) + 360);

        rotation = (Math.round(rng / ps) * ps);

        picked = Math.round(data.length - (rotation % 360) / ps);
        picked = picked >= data.length ? (picked % data.length) : picked;
        if (oldpick.indexOf(picked) !== -1) {
            d3.select(this).call(spin);
            return;
        } else {
            oldpick.push(picked);
        }
        rotation += 90 - Math.round(ps / 2);

        // play the audio
        var audio = new Audio('audio/spin.mp3');
        audio.volume = 0.4;
        audio.play();

        vis.transition()
            .duration(3000)
            // .attrTween("transform", rotTween)
            .attrTween("transform", () => {
                return function (t) {
                    var i = d3.interpolate(oldrotation % 360, rotation);
                    return "rotate(" + i(t) + ", 0, 0)";
                };
            })
            .each("end", function () {
                // mute the audio
                audio.muted = true;
                // mark segment as seen
                d3.select(".slice:nth-child(" + (picked + 1) + ") path").attr("fill", "#111");
                // make image as seen
                d3.select(".slice:nth-child(" + (picked + 1) + ") image").attr("opacity", "0.3");

                oldrotation = rotation;

                // /* Get the result value from object "data" */
                // console.log(data[picked])
                Swal.fire({
                    title: "<i>Người được chọn</i>",
                    html: `<div style="display: flex;flex-direction: column;align-items: center;justify-content: center;">
                        <img src="${data[picked].image}" />
                        <span>${data[picked].text}</span>
                    <div/>`,
                    confirmButtonText: "Đóng",
                });

                // /* Comment the below line for restrict spin to sngle time */
                // container.on("click", spin);
                d3.select("#spin-button").on('click', spin);
            });
    }
}

function rotTween(to) {
    var i = d3.interpolate(oldrotation % 360, rotation);
    return function (t) {
        return "rotate(" + i(t) + ")";
    };
}


function getRandomNumbers() {
    var array = new Uint16Array(1000);
    var scale = d3.scale.linear().range([360, 1440]).domain([0, 100000]);
    if (window.hasOwnProperty("crypto") && typeof window.crypto.getRandomValues === "function") {
        window.crypto.getRandomValues(array);
        console.log("works");
    } else {
        //no support for crypto, get crappy random numbers
        for (var i = 0; i < 1000; i++) {
            array[i] = Math.floor(Math.random() * 100000) + 1;
        }
    }
    return array;
}

const random = (min, max) => Math.random() * (max - min) + min;