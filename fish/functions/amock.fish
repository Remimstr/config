# Defined in - @ line 0
function amock --description 'alias amock=docker-compose -f ~/Acerta/amd/docker/start-compose.yml -f ~/Acerta/amd/docker/mock-compose.yml up'
	docker-compose -f ~/Acerta/amd/docker/start-compose.yml -f ~/Acerta/amd/docker/mock-compose.yml up $argv;
end
