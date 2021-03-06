# `itea-nodejs-project-articles-app`

### Description of the application (list of its endpoints)

```
GET / :: home page
	redirect to GET /articles

***

GET /auth :: current user
	if authenticated:
		if user prefers html:
			render user page
				(user page shows "username", "name", "age", and "id" fields, all read-only)
				(user page shows also "articles" link (href=/articles?author={user.username}))
				(user page shows also a form (method=POST, action=/auth/logout) with "logout" button (type=submit))
		else:
			return current user data
				(user data is a json containing "username" (string), "name" (string), "age" (string), and "id" properties)
	else:
		if user prefers html:
			set status 401
			render login page
				(login page shows a form (method=POST, action=/auth) with "username" input (type=text), "password" input (type=password), and "login" button (type=submit))
		else:
			send status 401

POST /auth :: login
body: {
	username: string
	password: string
}
	if not authenticated:
		try to authenticate using passport-local
	(then)
	redirect to GET /auth

DELETE /auth :: logout (endpoint for non-HTML agents)
	if user prefers html:
		send status 406
	else:
		if authenticated:
			logout
		(then)
		redirect to GET /auth

POST /auth/logout :: logout (endpoint for HTML agents)
	if user prefers html:
		if authenticated:
			logout
		(then)
		redirect to GET /auth
	else:
		send status 406

***

GET /articles :: paginated (?) list of articles
query: {
	author: string (username of an existing user)
	pagesize: number (integer; 1 <= pagesize <= 100)
	page: number (integer; 0 <= page < Infinity)
}
	pagination (optional):
		if query.pagesize is not valid:
			if user prefers html:
				fallback to 10 items per page
				(continue with no errors)
			else:
				set status 400
				send json with error description
				(don't continue)
		if query.page is not valid:
			if user prefers html:
				fallback to the first page
				(continue with no errors)
			else:
				set status 400
				send json with error description
				(don't continue)
		if query.author does not exist:
			if user prefers html:
				the list must be empty
				(continue with no errors)
			else:
				set status 400
				send json with error description
				(don't continue)
	(then)
	if pagination is implemented:
		infer mongodb query from data in req.query
		get articles from the database, sorted by "created" field, descending (most recent article is the first)
		set "nextPage" variable to string "/articles?author={query.author}&pagesize={query.pagesize}&page={query.page + 1}"
		if query.page > 0:
			set "prevPage" variable to string "/articles?author={query.author}&pagesize={query.pagesize}&page={query.page - 1}"
		else:
			set "prevPage" variable to null
		(then)
		if user prefers html:
			render articles page
				(articles page shows the list of all the found articles)
				(each article shows "title", "text", "author", "created", and "edited" fields, all read-only)
				(only the first 100 characters of article's "text" are shown)
				(article page shows also the "next page" link (href={nextPage}))
				if query.page > 0:
					(article page shows also the "prev page" link (href={prevPage}))
		else:
			send articles list
				(articles list is a json object containing "articles" (array), "nextPage", and "prevPage" properties)
				(each item in the "articles" array is a json object containing "title" (string), "text" (string), "author" (string), "created" (ISO Date string), and "edited" (ISO Date string) properties)

	else:
		get all articles from the database, sorted by "created" field, descending (most recent article is the first)
		(then)
		if user prefers html:
			render articles page
				(articles page shows the list of all the found articles)
				(each article shows "title", "text", "author", "created", and "edited" fields, all read-only)
				(only the first 100 characters of article's "text" are shown)
		else:
			send articles list
				(articles list is a json object containing "articles" (array) property)
				(each item in the "articles" array is a json object containing "title" (string), "text" (string), "author" (string), "created" (ISO Date string), and "edited" (ISO Date string) properties)

POST /articles :: create an article
body: {
	title: string
	text: string
}
	if not authenticated:
		redirect to GET /auth
	else:
		get article.title from req.body.title
		get article.text from req.body.text
		get article.author from currently authenticated user (req.user.username)
		get article.created from current date
		put new article to the db
		get article.id from db
		if user prefers html:
			redirect to GET /article/{article.id}
		else:
			set status 201
			return article id
				(article id is a string, or an arbitrary value returned by db, or a json object containing an id)

***

GET /articles/create :: show the "create article" page
	if user prefers html:
		if not authenticated:
			redirect to GET /auth
		else:
			render create article page
				(create article page shows a form (method=POST, action=/articles) with "title" input (type=text), "text" textarea, and "save" button (type=submit))
				(create article page shows also "cancel" button (type=reset, onclick=history.back()))
	else:
		send status 406

***

GET /articles/:id :: read the article
params: {
	id: string
}
	query db for the article
	if article is not found:
		if user prefers html:
			set status 404
			render error page
				(error page shows error message; in this case, it is "Article {params.id} is not found")
		else:
			send status 404
	else:
		if user prefers html:
			if authenticated, and current user is the author of the article:
				render own article page
					(own article page shows "title", "text", "author", "created", and (if not empty) "edited" fields, all read-only)
					(own article page shows also "edit" link (href=/articles/{params.id}/edit) and "delete" link (href=/articles/{params.id}/delete))
			else:
				render article page
					(article page shows "title", "text", "author", "created", and (if not empty) "edited" fields, all read-only)
		else:
			send article
				(article is a json object containing "title" (string), "text" (string), "author" (string), "created" (ISO Date string), and "edited" (ISO Date string) properties)

PATCH /articles/:id :: update the article (endpoint for non-HTML agents)
params: {
	id: string
}
body: {
	title: string
	text: string
}
	if user prefers html
		send status 406
	else if not authenticated:
		redirect to GET /auth
	else:
		query db for the article
		if article is not found:
			send status 404
		else if current user is not the author of the article:
			send status 401
		else:
			set article.title to body.title
			set article.text to body.text
			set article.edited to current date
			redirect to GET /article/{params.id}

DELETE /articles/:id :: delete the article (endpoint for non-HTML agents)
params: {
	id: string
}
	if user prefers html
		send status 406
	else if not authenticated:
		redirect to GET /auth
	else:
		query db for the article
		if article is not found:
			send status 404
		else if current user is not the author of the article:
			send status 401
		else:
			set status 204
			delete article from db
			send deleted article
				(deleted article is a json object containing "title" (string), "text" (string), "author" (string), "created" (ISO Date string), and "edited" (ISO Date string) properties)

***

GET /articles/:id/edit :: show the "edit article" page
params: {
	id: string
}
	if user prefers html:
		if not authenticated:
			redirect to GET /auth
		else:
			query db for the article
			if article is not found:
				set status 404
				render error page
					(error page shows message "Article {params.id} is not found")
			else if current user is not the author of the article:
				set status 401
				render error page
					(error page shows message "Article {params.id} cannot be edited by the current user")
			else:
				render edit article page
					(edit article page shows a form (method=POST, action=/articles/{params.id}/edit) with "title" input (type=text), "text" textarea, and "save" button (type=submit))
					(edit article page shows also "cancel" link (href=/articles/{params.id}))
	else:
		send status 406

POST /articles/:id/edit :: update the article (endpoint for HTML agents)
params: {
	id: string
}
	if user prefers html:
		if not authenticated:
			redirect to GET /auth
		else:
			query db for the article
			if article is not found:
				set status 404
				render error page
					(error page shows message "Article {params.id} is not found")
			else if current user is not the author of the article:
				set status 401
				render error page
					(error page shows message "Article {params.id} cannot be edited by the current user")
			else:
				set article.title to body.title
				set article.text to body.text
				set article.edited to current date
				redirect to GET /article/{params.id}
	else:
		send status 406

GET /articles/:id/delete :: show the "delete article" page
params: {
	id: string
}
	if user prefers html:
		if not authenticated:
			redirect to GET /auth
		else:
			query db for the article
			if article is not found:
				set status 404
				render error page
					(error page shows message "Article {params.id} is not found")
			else if current user is not the author of the article:
				set status 401
				render error page
					(error page shows message "Article {params.id} cannot be edited by the current user")
			else:
				render edit article page
					(edit article page shows message "Are you sure you want to delete article {params.id}?")
					(edit article page shows also a form (method=POST, action=/articles/{params.id}/delete) with "yes" button (type=submit))
					(edit article page shows also "no" link (href=/articles/{params.id}))
	else:
		send status 406

POST /articles/:id/delete :: delete the article (endpoint for HTML agents)
params: {
	id: string
}
	if user prefers html:
		if not authenticated:
			redirect to GET /auth
		else:
			query db for the article
			if article is not found:
				set status 404
				render error page
					(error page shows message "Article {params.id} is not found")
			else if current user is not the author of the article:
				set status 401
				render error page
					(error page shows message "Article {params.id} cannot be deleted by the current user")
			else:
				remove article from db
				redirect to GET /articles?author={req.user.username}
	else:
		send status 406
```
