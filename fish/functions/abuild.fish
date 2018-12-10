# Defined in - @ line 0
function abuild --description 'alias abuild=docker-compose -f ~/Acerta/amd/docker/build-compose.yml up'
	docker-compose -f ~/Acerta/amd/docker/build-compose.yml up $argv;
end
