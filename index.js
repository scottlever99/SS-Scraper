const pt = require('puppeteer');

const delay = ms => new Promise(res => setTimeout(res, ms));

function getNextDayOfTheWeek(dayName, refDate = new Date()) {
    const dayOfWeek = ["sun","mon","tue","wed","thu","fri","sat"]
                      .indexOf(dayName.slice(0,3).toLowerCase());
    if (dayOfWeek < 0) return;

    var seven = 7;

    refDate.setHours(0,0,0,0);
    refDate.setDate(refDate.getDate() + false + (dayOfWeek + seven - refDate.getDay() - false) % seven);
    return refDate;
}

function getNextWeek(date){
    date.setDate(date.getDate() + 7);
    return date;
}

function formatDate(date, withDash = false){
    let result = '';
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    if (month < 10) month = '0'+ month;
    var day = date.getDate();
    if (day < 10) day = '0'+ day;
    
    if (withDash) return result + year + '-' + month + '-' + day;

    return result + year + month + day;
}

(async () => {
    const browser = await pt.launch({
        headless : false,
        defaultViewport: null
    })
    const page = await browser.newPage()

    let firstTime = true;

    let fri = getNextDayOfTheWeek("Fri");
    let sun = getNextDayOfTheWeek("Sun");

    let fromLocArr = ['EMA', 'STN', 'BHX'];
    for(let weeks = 0; weeks < 6; weeks++){
        let formatFri = formatDate(fri);
        let formatSun = formatDate(sun);

        for(let fromLocInt = 0; fromLocInt < fromLocArr.length; fromLocInt++){
            let fromLoc = fromLocArr[fromLocInt];

            await page.goto('https://www.kayak.co.uk/explore/'+fromLoc+'-anywhere/'+formatFri+','+formatSun);
            await delay(3000);

            

            let body = await page.$('body');
            let id = await body.evaluate(e => e.id);

            if (firstTime){            
                let ntChild = 69;

                for(ntChild; ntChild < 75; ntChild++){
                    var acceptSelect = '#'+ id + ' > div:nth-child('+ ntChild + ') > div > div.dDYU.dDYU-mod-theme-default.dDYU-mod-variant-default.dDYU-mod-padding-none.dDYU-mod-position-top.dDYU-mod-direction-none.dDYU-mod-visible.a11y-focus-outlines.dDYU-mod-shadow-elevation-one > div > div > div.dDYU-body > div > div > div.iInN-footer > button';
                    let exists = (await page.$(acceptSelect)) || "";
                    if (exists !== "") break;
                }

                var acceptSelect = '#'+ id + ' > div:nth-child('+ ntChild + ') > div > div.dDYU.dDYU-mod-theme-default.dDYU-mod-variant-default.dDYU-mod-padding-none.dDYU-mod-position-top.dDYU-mod-direction-none.dDYU-mod-visible.a11y-focus-outlines.dDYU-mod-shadow-elevation-one > div > div > div.dDYU-body > div > div > div.iInN-footer > button';

                const acceptButton = await page.waitForSelector(acceptSelect);
                await acceptButton.click();

                firstTime = false;
            }

            await delay(2000);

            let gridItems = await page.$$('.Explore-GridViewItem')
            console.log(gridItems.length);
        

            for(let t = 0; t < gridItems.length; t++){
                var elId = await gridItems[t].evaluate(e => e.id);

                var countryNameEl = await page.waitForSelector('#'+elId+' > button > div > div._eY._iwG._ihs._irH > div._ibU._ibV._irp._ihr._ihs._1Z._idj._ilc._ihp._iai._ihq > div._iC8._1W._ib0._iYh._igh.Country__Name');
                var countryName = await countryNameEl.evaluate(e => e.innerHTML);

                let noGoCountries = ['United Kingdom', 'Ireland'];

                if (noGoCountries.includes(countryName)) continue;

                var priceEl = await page.waitForSelector('#'+elId+' > button > div > div._eY._iwG._ihs._irH > div._ihz._irp._iqB._ilc._iai > div._ib0._18._igh._ial._iaj');
                var price = (await priceEl.evaluate(e => e.innerHTML)).substring(6);

                console.log(countryName);
                console.log(price);

                if (price > 100) continue;

                var button = await page.waitForSelector('#'+elId+' > button');
                await button.click();

                await delay(2000);

                var checkoutBoxEl = await page.$('.Explore-FlightClickoutBox');
                var checkoutBoxId = await checkoutBoxEl.evaluate(e => e.id);
                var titleEl = await page.waitForSelector('#'+checkoutBoxId+' > div:nth-child(1) > div.clickout-box-title');
                var dest = (await titleEl.evaluate(e => e.innerHTML)).substring(7);
                console.log(dest);

                let formatNewFri = formatDate(fri, true);
                let formatNewSun = formatDate(sun, true);

                var flightPage = 'https://www.kayak.co.uk/flights/'+fromLoc+'-'+dest+'/'+formatNewFri+'/'+formatNewSun+'/?sort=price_a';

                let page2 = await browser.newPage();
                await delay(500);
                
                await page2.goto(flightPage);
                //await delay(25000); //USE THIS LATER
                await delay(500);

                //DO SOME STUFF

                await page2.close();

                let clickHeaderEl = await page.$$('.Explore-DrawerSectionHeader');
                console.log(clickHeaderEl.length);
                var index = 0;
                if (clickHeaderEl.length > 1) index = 1;
                let clickHeaderId = await clickHeaderEl[index].evaluate(e => e.id);
                let clickoutClose = await page.waitForSelector('#'+clickHeaderId+'-close');
                await clickoutClose.click();

                await delay(2000);

            }
        }

        

        fri = getNextWeek(fri);
        sun = getNextWeek(sun);
    }

    await browser.close()
  })()


  // OLD SCRAPE
  /*

      // var acceptSelect = '#'+ id + ' > div:nth-child('+ ntChild + ') > div > div.dDYU.dDYU-mod-theme-default.dDYU-mod-variant-default.dDYU-mod-padding-none.dDYU-mod-position-top.dDYU-mod-direction-none.dDYU-mod-visible.a11y-focus-outlines.dDYU-mod-shadow-elevation-one > div > div > div.dDYU-body > div > div > div.iInN-footer > button';
    // let exists = (await page.$(acceptSelect)) || "";
    // if (exists === "") {
    //     ntChild = 71;
    // }
    // acceptSelect = '#'+ id + ' > div:nth-child('+ ntChild + ') > div > div.dDYU.dDYU-mod-theme-default.dDYU-mod-variant-default.dDYU-mod-padding-none.dDYU-mod-position-top.dDYU-mod-direction-none.dDYU-mod-visible.a11y-focus-outlines.dDYU-mod-shadow-elevation-one > div > div > div.dDYU-body > div > div > div.iInN-footer > button';
    // if (exists === "") {
    //     ntChild = 72;
    // }
    // acceptSelect = '#'+ id + ' > div:nth-child('+ ntChild + ') > div > div.dDYU.dDYU-mod-theme-default.dDYU-mod-variant-default.dDYU-mod-padding-none.dDYU-mod-position-top.dDYU-mod-direction-none.dDYU-mod-visible.a11y-focus-outlines.dDYU-mod-shadow-elevation-one > div > div > div.dDYU-body > div > div > div.iInN-footer > button';
    // if (exists === "") {
    //     ntChild = 73;
    // }
    // acceptSelect = '#'+ id + ' > div:nth-child('+ ntChild + ') > div > div.dDYU.dDYU-mod-theme-default.dDYU-mod-variant-default.dDYU-mod-padding-none.dDYU-mod-position-top.dDYU-mod-direction-none.dDYU-mod-visible.a11y-focus-outlines.dDYU-mod-shadow-elevation-one > div > div > div.dDYU-body > div > div > div.iInN-footer > button';
    
      var htmlwords = await page.content();

    let id = '';

    var index = htmlwords.indexOf('<body id="');
    let startIndex = index + 10;
    for (let i = 0; i < 11; i++){
        var tempId = htmlwords.substring(startIndex + i, startIndex + i + 1);
        if (tempId === '"') break;
        id = id + tempId;
    }
    console.log(id);

    let ntChild = 13;
    var acceptButtonSelector = '#' + id + ' > div:nth-child(' + ntChild + ') > div > div.dDYU.dDYU-mod-theme-default.dDYU-mod-variant-default.dDYU-mod-padding-none.dDYU-mod-position-top.dDYU-mod-direction-none.dDYU-mod-visible.a11y-focus-outlines.dDYU-mod-shadow-elevation-one > div > div > div.dDYU-body > div > div > div.iInN-footer > button';
//'#T3BT > div:nth-child(13) > div > div.dDYU.dDYU-mod-theme-default.dDYU-mod-variant-default.dDYU-mod-padding-none.dDYU-mod-position-top.dDYU-mod-direction-none.dDYU-mod-visible.a11y-focus-outlines.dDYU-mod-shadow-elevation-one > div > div > div.dDYU-body > div > div > div.iInN-footer > button'
    let exists = (await page.$(acceptButtonSelector)) || "";
    if (exists === "") {
        ntChild = 14;
    }
    acceptButtonSelector = '#' + id + ' > div:nth-child(' + ntChild + ') > div > div.dDYU.dDYU-mod-theme-default.dDYU-mod-variant-default.dDYU-mod-padding-none.dDYU-mod-position-top.dDYU-mod-direction-none.dDYU-mod-visible.a11y-focus-outlines.dDYU-mod-shadow-elevation-one > div > div > div.dDYU-body > div > div > div.iInN-footer > button';
    
    const acceptButton = await page.waitForSelector(acceptButtonSelector);
    await acceptButton.click();

    const searchContainer = await page.$('.Ui-Searchforms-Flights-Components-FlightSearchForm-container');
    var searchId = await searchContainer.evaluate(e => e.id);
    console.log(searchId);

    

    var miniCloseButtonPath = '#'+ searchId + ' > div > div > div > div.zEiP-formContainer > div.zEiP-formBody > div > div.zEiP-formField.zEiP-origin > div > div > div > div:nth-child(1) > div.vvTc-item-close > div'
    const miniCloseButton = await page.waitForSelector(miniCloseButtonPath);
    await miniCloseButton.click();

    await delay(2000);

    await page.keyboard.type('EMA');

    await delay(2000);

    await page.keyboard.press('Enter');

    await delay(2000);

    var inputSelect = '#' + searchId + ' > div > div > div > div.zEiP-formContainer > div.zEiP-formBody > div > div.zEiP-formField.zEiP-origin > div > div > input';
    const input = await page.waitForSelector(inputSelect);
    await input.click();
    //await page.$eval(inputSelect, el => el.dataTestOrigin = 'EMA,BHX,STN');

    await delay(2000);

    await page.keyboard.type('BHX');

    await delay(2000);

    await page.keyboard.press('Enter');

    await delay(2000);

    await input.click();

    await delay(2000);

    await page.keyboard.type('STN');

    await delay(2000);

    await page.keyboard.press('Enter');

    await delay(2000);

    //'#DA9p > div > div > div > div.zEiP-formContainer > div.zEiP-formBody > div > div.zEiP-formField.zEiP-destination > div > div > input'
    var toInputSelect = '#'+ searchId + ' > div > div > div > div.zEiP-formContainer > div.zEiP-formBody > div > div.zEiP-formField.zEiP-destination > div > div > input';
    const toInput = await page.waitForSelector(toInputSelect);
    
    await toInput.click();

    await delay(2000);

    var anywhere = await page.waitForSelector('#anywhere > button');
    await anywhere.click();

    await delay(2000);




    '#popover > div > div.c2wZD-content > div > div.KK6S-calendarWrapper > div > div.ATGJ-monthWrapper > div:nth-child(1) > div.onx_-days > div.mkUa.mkUa-pres-mcfly.mkUa-mod-colorblind.mkUa-isStartDate.mkUa-isSelected.mkUa-isFocused.mkUa-isHighlighted'

*/
