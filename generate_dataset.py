import requests
from bs4 import BeautifulSoup
import sqlite3
import random
from random_word import RandomWords
randomWord = RandomWords()

# Function to search for random GitHub repositories
def search_random_repositories():

  # generate random word 
  word = randomWord.get_random_word()

  # Construct the API URL to search for repositories
  url = 'https://api.github.com/search/repositories?q=language:python&sort=stars'
  
  # Send a GET request to the GitHub API
  response = requests.get(url)

  # Check if the request was successful
  if response.status_code == 200:
    # Retrieve the JSON response
    data = response.json()
    
    repositories = data['items']
    
    if len(repositories) > 0:
      # Select a random repository
      repository = random.choice(repositories)
      
      owner = repository['owner']['login']
      repo = repository['name']
      
      return owner, repo
  
  # Handle API request error or no repositories found
  return None, None


# Function to scrape code blocks from a GitHub repository
def scrape_code_blocks(owner, repo):
    # Construct the API URL to get the repository contents
    url = f'https://api.github.com/repos/{owner}/{repo}/contents'
    
    # Send a GET request to the GitHub API
    response = requests.get(url)
    
    # Check if the request was successful
    if response.status_code == 200:
      # Retrieve the JSON response
      contents = response.json()

      urls = []
      def recursive_extract_code_blocks(contents):
        for item in contents:
          if item['type'] == 'dir':
            file_response = requests.get(item['url'])
            if file_response.status_code == 200:
              recursive_extract_code_blocks(file_response.json())
          elif item['type'] == 'file':
            if item['name'].endswith('.py'):
              urls.append(item['download_url'])

      recursive_extract_code_blocks(contents)
      code_blocks = []

      print(urls)
      
      # Iterate over the contents and find code files
      for url in urls:
        # Fetch the raw file content
        file_response = requests.get(url)

        if file_response.status_code == 200:
          # Create a BeautifulSoup object to parse the file content
          soup = BeautifulSoup(file_response.content, 'html.parser')
          
          # Find all <pre> elements that contain code blocks
          blocks = soup.find_all('h2')
          print(file_response.content)
          break
          print(blocks)
          
          # Extract the code from each code block
          # for block in blocks:
          #     code_blocks.append(block.get_text())
            
              
        
      return code_blocks
    else:
      # Handle API request error
      print(f"API request failed with status code: {response.status_code}")
      return []

# Function to save code blocks to a SQLite database
def save_to_database(code_blocks):
    # Connect to the SQLite database
    conn = sqlite3.connect('code_blocks.db')
    cursor = conn.cursor()
    
    # Create a table to store the code blocks
    cursor.execute('''CREATE TABLE IF NOT EXISTS code_blocks
                      (id INTEGER PRIMARY KEY AUTOINCREMENT,
                      code TEXT)''')
    
    # Insert each code block into the database
    for code_block in code_blocks:
        cursor.execute("INSERT INTO code_blocks (code) VALUES (?)", (code_block,))
    
    # Commit the changes and close the connection
    conn.commit()
    conn.close()

# Example usage
# owner, repo = search_random_repositories()
# print(owner, repo)
owner = 'bustin11'
repo = 'my-pictionary'

code_blocks = scrape_code_blocks(owner, repo)
save_to_database(code_blocks)
