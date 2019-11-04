const http = require('http');
//var bodyParser = require('body-parser')
const puppeteer = require('puppeteer');
const fs = require('fs');
const devices = require('puppeteer/DeviceDescriptors');
const request = require('request');
var usernames = {
    "facebook":"facebookusername",//Facebook username here
    "twitter":"twitterusername",//Twitter username here
    "instagram":"instagramusername"//Instagram username here
}
var passwords = {
    "facebook":"facebookpassword",//Facebook password here
    "twitter":"twitterpassword",//Twitter password here
    "instagram":"instagrampassword"//Instagram password here
}


var download = function (uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);

        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

var server = http.createServer(function (req, res) {

    if (req.method === "GET") {
        res.writeHead(200, {
            "Content-Type": "text/html"
        });


    } else if (req.method === "POST") {
        // console.log("Post recieved!")
        var body = "";
        req.on("data", function (chunk) {
            // console.log("Data incoming!")
            body += chunk;

        });

        req.on("end", function () {
            //res.writeHead(200, { "Content-Type": "text/html" });
            let readCollection = fs.readFileSync('future.json');
            var collection = JSON.parse(readCollection);
            var respJSON = JSON.parse(body);
            collection.push(respJSON);
            fs.writeFile('future.json', JSON.stringify(collection), function (err) {
                if (err) throw err;
                console.log('Saved!');
                console.log(respJSON);
                compareTime();
            });

        });
    }

}).listen(3000);

//Send at time!!
function compareTime() {
    let compareCollection = fs.readFileSync('future.json');
    var compcollection = JSON.parse(compareCollection);
    var getDateString = (new Date()).toLocaleDateString('en-GB').split("/");
    var compareDate = getDateString[1] + getDateString[0];

    for (i = 0; i < compcollection.length; i++) {
        if (compcollection[i].data[2] == compareDate) {
            console.log("Its Today! ");
            var url = compcollection[i].data[3];
            download(url, 'pics/postimg.png', function () {
                console.log('done');
            });

        } else {
            console.log("Not Today :( " + compcollection[i].data[2] + "vs " + compareDate)
        }
    }

}

//FACEBOOK STARTS HERE
async function postFace(param1) {
    const browser = await puppeteer.launch({
        //headless: false
    });
    var startTime = Date.now();
    /*
    let rawdata = fs.readFileSync('directs.json');
    let directs = JSON.parse(rawdata);*/
    //console.log(Object.keys(directs).length);

    //const browser = await puppeteer.launch({});
    var input = {
        username: usernames.facebook,
        password: passwords.facebook
    }
    const page = await browser.newPage();
    await page.goto('https://m.facebook.com');
    const context = browser.defaultBrowserContext();
    // URL An array of permissions
    context.overridePermissions("https://m.facebook.com", ["geolocation", "notifications"]);
    // Login
    await page.type('#m_login_email', input.username);
    await page.type('#m_login_password', input.password);
    await page.click("[name='login']");
    console.log("Login Success!")
    await page.waitForNavigation();
    // Get cookies
    const cookies = await page.cookies();
    // Use cookies in other tab or browser
    const page2 = await browser.newPage();

    await page2.setCookie(...cookies);
    console.log("Cookies got copied!");
    await page2.goto('https://m.facebook.com/Test-104348567647118');
    await page2.waitForSelector("[aria-label='Paylaş']")
    await page2.click("[aria-label='Paylaş']");
    await page2.type("[placeholder='Bir şeyler yaz...']", param1);
    const fileinput = await page2.$("#photo_input");
    await fileinput.uploadFile("pics/postimg.png");
    console.log("Started File upload!")
    await setInterval(async function () {

        try {
            await page2.waitFor("[data-sigil='touchable submit_composer']", {
                timeout: 1000
            });
            page2.click("[data-sigil='touchable submit_composer']")
        } catch (e) {
            clearInterval(this);
            console.log("Done");

            //process.exit(1);
        }

    }, 200);

    await page2.waitForNavigation();
    console.log("Finalizing Post...Took:" + ((Date.now() - startTime) / 1000) + " seconds for facebook!!");
    await browser.close();

    // Opens page as logged user

}

//TWITTER STARTS HERE
async function postTweet(param1) {
    const browser = await puppeteer.launch({
        //headless: false
    });

    var startTweet = Date.now();
    /*
    let rawdata = fs.readFileSync('directs.json');
    let directs = JSON.parse(rawdata);*/
    //console.log(Object.keys(directs).length);

    // const browser = await puppeteer.launch({});
    var input2 = {
        username: usernames.twitter,
        password: passwords.twitter
    }
    const page3 = await browser.newPage();
    await page3.goto('https://mobile.twitter.com/login');
    const context = browser.defaultBrowserContext();
    // URL An array of permissions
    context.overridePermissions("https://mobile.twitter.com/", ["geolocation", "notifications"]);
    // Login
    await page3.waitForSelector('[name="session[username_or_email]"]');
    await page3.type('[name="session[username_or_email]"]', input2.username);
    await page3.type('[name="session[password]"]', input2.password);
    await page3.click('[data-testid="LoginForm_Login_Button"]');
    console.log("Login Success for Twitter!")
    await page3.waitForSelector('[data-testid="SideNav_NewTweet_Button"]');
    await page3.click('[data-testid="SideNav_NewTweet_Button"]');
    console.log("Typing Tweet");
    await page3.waitForSelector('[data-testid="tweetTextarea_0"]');
    await page3.type('[data-testid="tweetTextarea_0"]', param1);
    const fileinput = await page3.$('[type="file"]');
    await fileinput.uploadFile("postimg.png");
    console.log("Sending Tweet");
    await page3.waitFor(200);
    await page3.click('[data-testid="tweetButton"]');
    console.log("Finalizing Post...Took:" + ((Date.now() - startTweet) / 1000) + " seconds for Twitter!!");
    await page3.waitForNavigation();
    await browser.close();

}
//INSTAGRAM STARTS HERE
async function postInsta(param1) {
    const browser = await puppeteer.launch({
        headless: false
    });
    var startInsta = Date.now();
    /*
    let rawdata = fs.readFileSync('directs.json');
    let directs = JSON.parse(rawdata);*/
    //console.log(Object.keys(directs).length);

    // const browser = await puppeteer.launch({});
    var input3 = {
        username: usernames.instagram,
        password: passwords.instagram
    }
    const page4 = await browser.newPage();
    await page4.setExtraHTTPHeaders({
    'Accept-Language': 'en'
});
    await page4.emulate(devices['Nexus 5']);
    const headlessUserAgent = await page4.evaluate(() => navigator.userAgent);
    console.log(headlessUserAgent);
    await page4.goto('https://www.instagram.com/accounts/login/');
    const context = browser.defaultBrowserContext();
    // URL An array of permissions
    context.overridePermissions("https://www.instagram.com/", ["geolocation", "notifications"]);
    // Login
    await page4.waitForSelector('[name ="username"]');
    await page4.type('[name="username"]', input3.username);
    await page4.type('[name="password"]', input3.password);
    await page4.click('[type="submit"]');
    await page4.waitForNavigation();
    console.log("Login Success for Insta!")
    await page4.waitForSelector('.GAMXX');
    await page4.click('.GAMXX');
    //await page4.waitForNavigation();
    await page4.waitForSelector('.HoLwm');
    await page4.click('.HoLwm');

    page4.waitForSelector('[aria-label="New Post"]');
    console.log("Selecting Picture (Instagram)")
    const [fileChooser] = await Promise.all([
  page4.waitForFileChooser(),
  page4.click('[aria-label="New Post"]') // some button that triggers file selection
]);
    await page4.waitFor(1000);
    await fileChooser.accept(["pics/postimg.png"]);
    await page4.waitForSelector(".UP43G");
    await page4.click(".UP43G");
    //await page4.screenshot({ path: 'screenshot.png' });
    await page4.waitForSelector('[placeholder="Write a caption…"]');
    console.log("Writing caption (Instagram)")
    await page4.type('[placeholder="Write a caption…"]', param1);
    await page4.waitForSelector(".UP43G");
    await page4.click(".UP43G");
    await page4.waitForNavigation();
    console.log("Finalizing Post...Took:" + ((Date.now() - startInsta) / 1000) + " seconds for instagram!!");
    await browser.close();

}


async function startBroadcast(data) {
    await Promise.all([
  postFace(data),
  postTweet(data),
    postInsta(data)

]);
}
/*
postInsta("Test123123");*/
console.log(usernames.facebook);
//startBroadcast();
