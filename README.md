# Simple js blog
This is my JS blog.
It's probably not fit for production, so don't install it anywhere publicly accessible.
Rquires [markdown.min.js](https://github.com/evilstreak/markdown-js) in the main directory. Add markdown files to ./posts/, and update the postList.json file in there accordingly.
I may add a way of automatically generating this at some point based on some kind of section in the markdown files, but for now this must be manually edited.
Any occurrences of "%current-domain" in markdown files will be replaced with the blog's URL (an example of a valid link would be http://%current-domain/somePage.html).
