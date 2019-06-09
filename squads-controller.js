var app = angular.module('SquadsApp', []);
app.controller('SquadsCtrl', function($scope, $timeout) {

    $scope.menuOpened = false;
    $scope.compactMode = true;
    $scope.squadsData = SQUADS_DATA.squads;
    $scope.skillsData = null;
    $scope.currentSkillFilter = null;
    $scope.memberOverPromise = null;

    init();

    function init(){
        $scope.skillsData = buildSkillData($scope.squadsData);
    }

    //Monta uma lista de skills separada por área baseado nos membros das squads
    function buildSkillData(squads){
        let allSkills = [];

        //pegamos todos os skills
        squads.forEach(function (squad) {
            squad.members.forEach(function (member) {
                allSkills = allSkills.concat(member.skills);
            });
        });

        //agrupamos todos os skills por tipo
        let skillsByType = groupSkillsByType(allSkills);

        return covertToArrayAndSort(skillsByType);
    }

    //Convert um objeto de skill em um array exemplo {'ui':['a','b','c']} em [['ui',['a','b','c']]
    function covertToArrayAndSort(skillsByType){
        let skillsData = [];

        for (let type in skillsByType) {
            let sortable = skillsByType[type].sort();

            skillsData.push([type, sortable]);
        }
        
        //ordenamos para que o tipo outros seja o último da lista
        return skillsData.sort(function(a, b) {
            if(a[0] == 'other'){
                return 1;
            } else if(b[0] == 'other'){
                return -1;
            }

            return a[0].localeCompare(b[0]);
        });
    }

    //Agrupa os skills por tipo
    function groupSkillsByType(skills) {
        let skillsByType = {};

        skills.forEach(function (skill) {
            let type = skill.split(':')[0];
            let skillName = skill.split(':')[1].replace(/specialist|evangelist/i,'').trim();
            
            if(skillsByType[type] == null){
                skillsByType[type] = [];
            }
            
            if(skillsByType[type].indexOf(skillName) == -1){
                skillsByType[type].push(skillName);
            }
        });

        return skillsByType;
    }

    function cloneObject(object) {
        return JSON.parse(JSON.stringify(object));
    }

    $scope.resetFilter = function(){
        $scope.currentSkillFilter = null;
        $scope.squadsData = cloneObject(SQUADS_DATA.squads);
    };

    $scope.openMenu = function() {
        $scope.menuOpened = ! $scope.menuOpened;
    };

    $scope.changeMode = function() {
        $scope.compactMode = ! $scope.compactMode;
    };

    //Filtramos todos os membros que possua o skill desejado
    $scope.filterBySkill = function(skillType, skillName){
        $scope.resetFilter();

        $scope.squadsData = $scope.squadsData.filter(function(squad){
            let membersWithThisSkill = squad.members.filter(function (member) {
                
                //filtra os skills do membro pelo skill desejado
                let result = member.skills.filter(function(skill){
                    //retiramos o que não interessa da skill exemplo 'ui:UX Designer specialist' fica 'UX Designer'
                    let name = skill.replace(/\w+:|specialist|evangelist/ig, '').trim();

                    if(name == skillName){
                        return true;
                    }else{
                        return false;
                    }
                });
                
                //removemos o membro caso não possua o skill desejado
                return result.length > 0;
            });

            squad.members = membersWithThisSkill;

            //removemos a squad caso não possua nenhum membro com skill desejado
            return squad.members.length > 0;
        });

        //atualizamos o filtro corrente
        $scope.currentSkillFilter = [skillType, skillName];
    };

    $scope.memberMouseOver = function(e){
        $timeout.cancel($scope.memberOverPromise);

        var elem = angular.element(e.currentTarget)[0];

        $scope.memberOverPromise = $timeout(function() {
            elem.classList.add('hover');
        }, 1000);
    };

    $scope.memberMouseOut = function(e){
        $timeout.cancel($scope.memberOverPromise);

        let elem = angular.element(e.currentTarget)[0];
        let toElem = angular.element(e.toElement)[0];
        
        if(!elem.contains(toElem)){
            elem.classList.remove('hover');
        }
    };
});