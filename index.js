#! /usr/bin/env node
const readline = require('readline'); 
const fs = require('fs');

const EXEC = require('child_process').exec;

const TEMPLATE = '[DEP]\n\n[DB1]\n\n[DB2]\n\n[NASFILE]\n\n[NOTIFY]\n\n[ADVICE]\n\n[STATEMENT]';
const PATH = "./";
const PROJECT_FILE='./.tag';
const PROJECT_FILE_CONTEXT = "[PRE_TAG]="

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


let dateFileName = '';

let init = ()=>{

	let tagPreName = "";
	let releaseDate = "";
	getBranchName().then(function(branchName){

		releaseDate = isSpecialRelease(branchName);

		let p =  new Promise(function(resolve, reject){
			if(releaseDate){
				
				tagPreName = `${branchName.toLowerCase()}_`;
				resolve(tagPreName);
			}else{
			
				getInput().then(function(answer){
					tagPreName = `dev_${answer}_`;
					resolve(tagPreName);
				});
			}
		});

		p.then(function(tagPreName){
			//console.log(`RELEASE DATE PRE NAME IS ${tagPreName}`);
			createFiles(tagPreName, branchName);
		})

		
	})
}

let tag =()=>{

	getTagPrefix().then(function(tagPrefix){

		EXEC("git pull", function(error, stdout, stderr){
		    if(error) {
		        console.error('ERROR: ' + error);
		        return;
		    }
		    getTagList(tagPrefix);
		},function(){
			//error when get tag prefix
			init();
		});
	})

	
}

function getTagList(tagPrefix){
	let tagPattern = `git tag -l '${tagPrefix}*'`;

	EXEC(tagPattern, function(error, stdout, stderr){
	    if(error) {
	        console.error('ERROR: ' + error);
	        return;
	    }
		
	    autoTag(tagPrefix, stdout);
	});
}

function getLatestTag(tagPrefix, output){
	const REGEXP = /^(reg|emp|quick|dev)\_(\d{8})_(\d{2})$/i;
	let latestTag = `${tagPrefix}01`;
	if(output){
		let tagArr = output.trim().split("\n");
		
		if(tagArr && tagArr.length && tagArr.length > 0){
			let latest = tagArr[tagArr.length -1];
		}
		
		for(let i = tagArr.length -1; i >= 0; i--){
			let result = tagArr[i].match(REGEXP);
			if(!result){
				continue;
			}
			
			let suffix = result[3] - 0 + 1;
			if(suffix < 10){
				suffix = `0${suffix}`;
			}
			latestTag =  `${tagPrefix}${suffix}`;
			break;
		}
	}
	
	return latestTag;
}



function autoTag(tagPrefix, output){
	
	let tagName = getLatestTag(tagPrefix, output);
	
	console.dir(`TAGNO IS : ${tagName}`)

	EXEC(`git tag ${tagName}` , function(error, stdout, stderr){
	    if(error) {
	        console.error('ERROR: ' + error);
	        return;
	    }
	    pushTag(tagName);
	    
	});
}

function pushTag(tagName){
	EXEC(`git push origin -u ${tagName}`, function(error, stdout, stderr){
	    if(error) {
	        console.error('error: ' + error);
	        return;
	    }
	    console.log(`${tagName} CREATED SUCCESSFULLY...`);
	    
	});
}

function getTagPrefix(){
	return getBranchName().then(function(branchName){
		let p = new Promise(function(resolve, reject){

			EXEC(`git config branch.${branchName}.description`, function(error, stdout, stderr){
			    if(error) {
			        console.error(`ERROR WHEN GET BRANCH DESCRIPTION; PLEASE RUN ' tt init' COMMAND FIRST. `);
			        reject();
			    }
			    resolve(stdout.trim());
			});
		});
		return p;
	});
}


function readProjectFile(){

	let p = new Promise(function(resolve, reject){

		fs.readFile(PROJECT_FILE, 'utf8', (err, data) => {

			try{
				if (err) throw err;

				const REGEXP = /\[PRE_TAG\]\=((reg|emp|quick|dev)\_\d{8}_)/i;

				const releaseTagPrefix = data.match(REGEXP)[1];

				resolve(releaseTagPrefix);

			}catch(error){

			  	console.error(error);

			  	reject(null);

			}

		}); 
	});

	return p;
	
}


function getBranchName(){

	let p = new Promise(function(resolve, reject){

		EXEC(`git rev-parse --abbrev-ref HEAD`, function(error, stdout, stderr){
		    if(error) {
		        console.error(`ERROR: ${error}`);
		        reject(null);
		    }
		    resolve(stdout.trim());
		});
	});
	return p;
}


function isSpecialRelease(branchName){
	const REGEXP = /(Reg|Emp|Quick)\_(\d{8})$/i;
	let tag = branchName.match(REGEXP);

	if(tag && tag.length && tag.length > 2){
		return tag[2];
	}
	return false;
}

function createFiles(tagPreName, branchName){
		const REGEXP = /^(reg|emp|quick|dev)\_(\d{8})_$/i;

		let tagArr = tagPreName.match(REGEXP);

		if(!tagArr || !tagArr.length || tagArr.length <= 2){
			return false;
		}

		let date = tagArr[2];

		dateFileName = `./release/${date}.txt`;

		fs.access(dateFileName, (err)=>{
			if(!err){
				console.log("RELEASE FILE EXISTED, DO NOTHING")
				return;
			}else{
				fs.appendFile(dateFileName, TEMPLATE, (err)=>{
					if(err){
						console.log("ERROR WHEN CREATING RELEASE FILE");
					}else{
						console.log(`RELEASE FILE ${date} CREATED`);
					}
				
		  		});
			}
		});

		EXEC(`git config branch.${branchName}.description "${tagPreName}"`, function(error, stdout, stderr){
		    if(error) {
		        console.error('ERROR IN WRITING BRANCH DESCRIPTION: ' + error);
		        return;
		    }
		    //getTagList(tagPrefix);
		});

}

function getInput(){
	return new Promise(function(resolve, reject){
		recursiveReadLine(resolve, reject);
	});
}

function recursiveReadLine(resolve, reject, isError){
	let msg = isError ? 'INPUT IS NOT CORRECT, PLEASE INPUT THE DATE IN  YYYYMMDD FORMAT\n' : 'PLEASE INPUT PUBLISH DATE IN  YYYYMMDD FORMAT\n';

	rl.question(msg, (answer) => {
	  
	    let releaseDay = answer.trim();
	    const REGEXP = /^(\d{8})$/i;
		let day = releaseDay.match(REGEXP);
		if(day && day.length && day.length >= 2 ){
			rl.close();
			resolve(day[1]);
		}else{
			recursiveReadLine(resolve, reject, true);
		}
	});
}

if(process.argv.length > 2){
	init();
}else{
	tag();
}






