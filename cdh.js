var width = 600,
      height =400,
      radius = Math.min(width, height) / 2;

    var x = d3.scale.linear()
      .range([0, 2 * Math.PI]);

    var y = d3.scale.linear()
      .range([0, radius]);

    var color = d3.scale.category20c();


    var svg = d3.select(".sunburst").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("preserveAspectRatio", "xMidYMid")
      .attr("viewBox", "0 0 600 400")
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");


    var partition = d3.layout.partition()
      .value(function(d) {
        return d.size;
      });

    var arc = d3.svg.arc()
      .startAngle(function(d) {
        return Math.max(0, Math.min(2 * Math.PI, x(d.x)));
      })
      .endAngle(function(d) {
        return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));
      })
      .innerRadius(function(d) {
        return Math.max(0, y(d.y));
      })
      .outerRadius(function(d) {
        return Math.max(0, y(d.y + d.dy));
      });

    d3.json("data.json", function(error, root) {
      var g = svg.selectAll("g")
        .data(partition.nodes(root))
        .enter().append("g");


      d3.select("g").append("svg:image")
        .attr('x', -65)
        .attr('y', -65)
        .attr('width', 130)
        .attr('height', 130)
        .attr("xlink:href", "img/hiester_profile_circle_200.png")
        .on("mouseover", function() {
          var sel = d3.select(this);
          sel.moveToBack();
        });



      var path = g.append("path")
        .attr("d", arc)
        .style("fill", function(d) {
          return color((d.children ? d : d.parent).name);
        })
        .on("click", click)
        .on("mouseover", doHover)
        .on("mouseout", unDoHover);

      var text = g.append("text")
        .attr("transform", function(d) {


          return "rotate(" + computeTextRotation(d) + ")";
        })
        .attr("x", function(d) {
          return y(d.y);
        })
        .attr("dx", "6") // margin
      .attr("dy", ".35em") // vertical-align
      .text(function(d) {
        return d.name;
      }).on("click", click)
        .on("mouseover", doHover)
        .on("mouseout", unDoHover);

      d3.select("g g").transition().duration(200).attr("opacity", "0");

      function click(d) {

        // fade out all text elements
        text.transition().attr("opacity", 0);

        path.transition()
          .duration(750)
          .attrTween("d", arcTween(d))
          .each("end", function(e, i) {
            // check if the animated element's data e lies within the visible angle span given in d
            if (e.x >= d.x && e.x < (d.x + d.dx)) {
              // get a selection of the associated text element
              var arcText = d3.select(this.parentNode).select("text");
              // fade in the text element and recalculate positions
              arcText.transition().duration(750)
                .attr("opacity", 1)
                .attr("transform", function() {
                  return "rotate(" + computeTextRotation(e) + ")"
                })
                .attr("x", function(d) {
                  return y(d.y);
                });
            }
          });
      };

      d3.selection.prototype.moveToBack = function() {
        return this.each(function() {
          var firstChild = this.parentNode.firstChild;
          if (firstChild) {
            this.parentNode.insertBefore(this, firstChild);
          }
        });
      };



      function doHover(d) {
        d3.select(this.parentNode.childNodes[0]).transition().duration(200).attr("opacity", "0.1");
        d3.select("g g").transition().duration(200).attr("opacity", "0");
      };

      function unDoHover(d) {
        d3.select(this.parentNode.childNodes[0]).transition().duration(200).attr("opacity", "1");
        d3.select("g g").transition().duration(200).attr("opacity", "0");
      };

      function rootHide(d) {
        d3.select("g g").transition().duration(200).attr("opacity", "0");

      }

      function rootShow(d) {
        d3.select("g g").transition().duration(200).attr("opacity", "0");

      }
    });

    d3.select(self.frameElement).style("height", height + "px");

     // Interpolate the scales!
    function arcTween(d) {
      var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
        yd = d3.interpolate(y.domain(), [d.y, 1]),
        yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
      return function(d, i) {
        return i ? function(t) {
          return arc(d);
        } : function(t) {
          x.domain(xd(t));
          y.domain(yd(t)).range(yr(t));
          return arc(d);
        };
      };
    }


    function computeTextRotation(d) {
      return (x(d.x + d.dx / 2) - Math.PI / 2) / Math.PI * 180;
    }

    var chart = $("svg"),
      aspect = chart.width() / chart.height(),
      container = chart.parent();
    $(window).on("resize", function() {
      var targetWidth = container.width();
      chart.attr("width", targetWidth);
      chart.attr("height", Math.round(targetWidth / aspect));
    }).trigger("resize");
