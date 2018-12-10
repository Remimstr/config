# Defined in - @ line 0
function astart --description 'alias astart=docker-compose -f ~/Acerta/amd/docker/start-compose.yml up'
	docker-compose -f ~/Acerta/amd/docker/start-compose.yml up $argv;
end
