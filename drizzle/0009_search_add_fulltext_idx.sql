-- Custom SQL migration file, put your code below! --
CREATE FULLTEXT INDEX content_fulltext_idx ON post(content);
