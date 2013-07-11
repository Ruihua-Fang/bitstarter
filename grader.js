#!/usr/bin/env node
/*
automatically grade files for the presence of specified HTML tags/attributes.
ses commander.js and cheerio.  Teaches command line application development and basic DOM parsing.
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var sys  = require('util');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_STRING_DEFAULT = 'http://mysterious-eyrie-4304.herokuapp.com';
var outputfile = "hw3_3_output";
//testing:
//var checksfile = CHECKSFILE_DEFAULT;
//var url_string = URL_STRING_DEFAULT;

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist.  Exiting.", instr);
        process.exit(1);  //http://nodejs.org/api/process.html#process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};

    for (var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var checkURL = function(url_string, checksfile) {
    rest.get(url_string).on('complete', function(result) {
        if(result instanceof Error) {
            sys.puts('Error: ' + result.message);
            this.retry(5000);
	} else {
            $ = cheerio.load(result);
            var checks = loadChecks(checksfile).sort();
            var out = {};
            for(var ii in checks) {
                var present = $(checks[ii]).length > 0;
                out[checks[ii]] = present;
	    }
            var output = JSON.stringify(out, null, 4);
            fs.writeFileSync(outputfile, output);
	}
    });
}

var clone = function(fn) {
    //workaround for commander.js issue
    //http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program 
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists)) //, CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists)) //, HTMLFILE_DEFAULT)
        .option('-u, --url <url_string>', 'url displaying index.html') //, URL_STRING_DEFAULT)
        .parse(process.argv);
    
    if(program.file !== undefined) {
        var checkJson = checkHtmlFile(program.file, program.checks);
        var outJson = JSON.stringify(checkJson, null, 4);
        console.log(outJson);
        fs.writeFileSync(outputfile, outJson);    
    } else {
	checkURL(program.url, program.checks );
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}

