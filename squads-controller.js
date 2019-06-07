var app = angular.module("SquadsApp", []);
app.controller("SquadsCtrl", function($scope) {

    $scope.menuOpened = false;
    $scope.compactMode = true;
    $scope.squadsData = SQUADS_DATA.squads;
    $scope.skillsData = null;
    $scope.skillFilter = null;

    init();

    function init(){
        $scope.skillsData = buildSkillData($scope.squadsData);
        console.log($scope.skillsData);
    }

    function buildSkillData(squads){
        let skills = [];

        squads.forEach(function (squad) {
            squad.members.forEach(function (member) {
                skills = skills.concat(member.skills);
            });
        });

        let skillsByType = groupSkillsByType(skills);

        return covertToArrayAndSort(skillsByType);
    }

    function covertToArrayAndSort(skillsByType){
        let skillsData = [];

        for (let type in skillsByType) {
            let sortable = skillsByType[type].sort();

            skillsData.push([type, sortable]);
        }
        
        return skillsData.sort(function(a, b) {
            if(a[0] == 'other'){
                return 1;
            } else if(b[0] == 'other'){
                return -1;
            }

            return a[0].localeCompare(b[0]);
        });
    }

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
        $scope.skillFilter = null;
        $scope.squadsData = cloneObject(SQUADS_DATA.squads);
    };

    $scope.openMenu = function() {
        $scope.menuOpened = ! $scope.menuOpened;
    };

    $scope.changeMode = function() {
        $scope.compactMode = ! $scope.compactMode;
    };

    $scope.filterBySkill = function(skillType, skillName){
        $scope.resetFilter();

        $scope.squadsData = $scope.squadsData.filter(function(squad){
            let membersWithThisSkill = squad.members.filter(function (member) {
                
                //busca pelo skill na lista de skill do membro da squad
                let result = member.skills.filter(function(skill){
                    if(skill.match(new RegExp(skillName, 'ig'))){
                        return true;
                    }else{
                        return false;
                    }
                });
                
                //se não tiver o skill retiramos o membro
                return result.length > 0;
            });

            squad.members = membersWithThisSkill;

            //se não tiver nenhum membro com esse skill retiramos a squad
            return squad.members.length > 0;
        });

        $scope.skillFilter = [skillType, skillName];
    };
});