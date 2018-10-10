var app = new Vue({
    el: "#app",
    data: {
        endpoint: "/app/app.php",
        debug: false,
        admin: true,
        location: 0,
        database: [],
        thread: {},
        new_thread: false,
    },
    methods: {
        find_by_id: function(id) {
            for(i=0; i<this.database.length; i++) {
                if ( this.database[i].id == id ) {
                    return i;
                }
            }
            return false;
        },
        load_database: function() {
            var that = this;
            $.ajax({
                url: that.endpoint+"?action=load",
                cache: false,
                async: false,
            }).done(function (data) {
                that.database = JSON.parse(data);
            });
        },
        load_thread(id) {
            var target = this.find_by_id(id);
            this.thread = this.database[target];
        },
        count_comments(id) {
            var count = 0;
            for(i=0; i<this.database.length; i++) {
                if(this.database[i].parent == id) {
                    count++;
                }
            }
            return count;  
        },
    },
    watch: {
        location: function () {
            this.load_thread(this.location);
        },
    },
    mounted: function() {
        this.load_database();
        if(thread_id != 0) {
            this.location = thread_id;
        }
        var that = this;
        setInterval(function(){ 
            that.load_database();
        }, 1000);
    }
});

document.onkeydown = function(evt) {
    evt = evt || window.event;
    if (evt.keyCode == 27) {
        app.location = 0;
        location = "/";
    }
};

$(document).ready(function($){
    $("#app").show();
});