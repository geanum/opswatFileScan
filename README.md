# OPSWAT File Scan
This is a simple node program that allows the user to scan individual files using OPSWAT's MetaDefender API.

# Environment and SetUp

This solution uses the current Node.JS LTS (8.x). I did also test it using the latest Node 10 and that also seems to work, so anything above 8 should work fine. 

Make sure to run the following after pulling the repo:

``` npm install ```


You should place your API key on `opswat.js:6`.

```
  ...
  const OpswatAPI = {

  baseUrl: 'https://api.metadefender.com/v2',
  apiKey: 'YOUR_API_KEY',  // place your API key here (keep quotes and comma)
  
  ...
```

# Running the Solution

To scan a file simply input the name of the file (or its path) as a command line argument when you're running `scan.js`.
Example: sample.txt is the target file

```
  node scan.js sample.txt
```

# Methodology
The methodology closely follows the logical steps outlined in the original problem description:

1. Calculate the hash of the given samplefile.txt
2. Perform a hash lookup against metadefender.opswat.com and see if their are previously cached results for the file
3. If results found then skip to 6
4. If results not found then upload the file, receive a data_id
5. Repeatedly pull on the data_id to retrieve results
6. Display results 

The abbreviated code snippet below (original found around scan.js:20) attempts to clearly illustrate these steps.

```  
  // 1. Calculate the hash of the given samplefile.txt
  return hashFile(targetFile)
  
  // 2. Perform a hash lookup against metadefender.opswat.com and see if their are previously cached results for the file
  .then((hash) => OpswatAPI.getHashLookup(hash))
  
  .then((response) => {
    // 3. If results found then skip to 6
    if (response.file_id) 
      return response;
    // 4. If results not found then upload the file, receive a data_id
    else {
      return scanFile(targetFile); 
    }
  })
  
  // 6. Display results
  .then((results) => printResults(targetFile, results))
  
 ```
 
Step 5 is missing from the above snippet because it is abstracted away as a seperate function to be used in `scanFile()`. Here is the function: 

``` 
  const pullResults = (dataId) => {
    return new Promise((resolve, reject) => {
      OpswatAPI.getScanReport(dataId)
      .then((response) => {
        if (response.file_id)  // if scans completed
          return resolve(response);
        else // else keep trying until scans completed
          return resolve(pullResults(dataId));
      })
    })
  }
  
```

One instructive moment I had was when I was creating this functionality. Originally, I was worried that repeated recursive calls would take up space on the call stack. In the event of the file getting stuck in queue, this would lead to all of the call stack getting eaten up by the recursive calls and eventual program failure. However, I soon learned that asynchronous function calls do not eat up the call stack in this way!

# Other Random Choices

- I kept all HTTP requests in `opswat.js` to keep things organized and essentially make a small OPSWAT API library for my uses.
- I made use of promises to keep code cleaner (I usually try to avoid a bunch of nested callbacks.)
- I decided to use Axios, an HTTP request library, to perform all requests because it's simple to use and supports promises right out of the box.
- I used the native Node libraries `fs` for accessing the file system, and `crypto` for hashing the files.
- More indepth methodology of each step can be found in their respective functions
